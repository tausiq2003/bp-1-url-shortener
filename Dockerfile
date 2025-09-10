FROM node as base


FROM base as builder

FROM WORKDIR /home/build

COPY package*.json .
COPY tsconfig.json .

RUN npm install 

COPY . .

RUN npm run build

FROM base as runner

WORKDIR /home/app

COPY --from=builder /home/build/dist dist/
COPY --from=builder /home/build/package*.json .

RUN npm install --omit=dev

CMD ["npm", "run", "start"]






