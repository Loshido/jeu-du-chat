FROM denoland/deno:alpine AS build
WORKDIR /app

COPY . .
RUN deno install
RUN deno task build
RUN deno cache app/index.ts

FROM denoland/deno:alpine
WORKDIR /app

COPY --from=build /app/app app
COPY --from=build /app/dist dist

EXPOSE 8000
CMD ["deno", "run", "--allow-net", "--allow-read", "app/index.ts"]