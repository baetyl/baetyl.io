FROM baetyltech/baetyl.io:build AS build
COPY . /baetyl
RUN make -C /baetyl/docs-cn html
RUN make -C /baetyl/docs-en html

FROM nginx:alpine
COPY --from=build /baetyl/www /usr/share/nginx/baetyl.io
COPY --from=build /baetyl/docs-cn/_build/html /usr/share/nginx/baetyl.io/docs/cn/latest
COPY --from=build /baetyl/docs-en/_build/html /usr/share/nginx/baetyl.io/docs/en/latest
COPY --from=build /baetyl/baetyl.conf /etc/nginx/conf.d/
EXPOSE 80 443
