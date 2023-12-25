# syntax=docker/dockerfile:1.4

####################################################################################################
## Build Packages

FROM node:18 AS builder
WORKDIR /directus

ARG TARGETPLATFORM

ENV NODE_OPTIONS=--max-old-space-size=8192

RUN <<EOF
  if [ "$TARGETPLATFORM" = 'linux/arm64' ]; then
  	apk --no-cache add python3 build-base
  	ln -sf /usr/bin/python3 /usr/bin/python
  fi
EOF

# node镜像安装 pnpm
RUN npm install --global pnpm@8

# pnpm 切换淘宝源
RUN pnpm config set registry https://registry.npm.taobao.org
COPY pnpm-lock.yaml .
RUN pnpm fetch

COPY . .
RUN pnpm install --recursive --offline --frozen-lockfile && \
	npm_config_workspace_concurrency=1 pnpm run build && \
	pnpm --filter directus deploy --prod dist && \
	cd dist && \
	# Regenerate package.json file with essential fields only
	# (see https://github.com/directus/directus/issues/20338)
	node -e ' const f = "package.json", {name, version, type, exports, bin} = require(`./${f}`), {packageManager} = require(`../${f}`); fs.writeFileSync(f, JSON.stringify({name, version, type, exports, bin, packageManager}, null, 2));' && \
	mkdir -p database extensions uploads


####################################################################################################
## Create Production Image

FROM node:18 AS runtime
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install --global pm2@5

USER node

WORKDIR /directus

EXPOSE 8055

ENV \
	DB_CLIENT="sqlite3" \
	DB_FILENAME="/directus/database/database.sqlite" \
	NODE_ENV="production" \
	NPM_CONFIG_UPDATE_NOTIFIER="false"

COPY --from=builder --chown=node:node /directus/ecosystem.config.cjs .
COPY --from=builder --chown=node:node /directus/dist .

CMD : \
	&& node cli.js bootstrap \
	&& pm2-runtime start ecosystem.config.cjs \
	;
