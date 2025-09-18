# cluster-freeze

How to reproduce:
1. Configure .env with the Database URL for the cluster
2. Run `manager.ts`, for example `tsx client.ts`.
3. Run two `runner.ts`, for example `tsx runner.ts` and `PORT=34432 tsx runner.ts`.
4. Run `client.ts`, for example `tsx client.ts`.

(notice code froze on 4)