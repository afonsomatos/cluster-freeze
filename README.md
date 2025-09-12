# cluster-freeze-2

How to reproduce:
1. Configure .env with the Database URL for the cluster
2. Run `manager.ts`, for example `tsx manager.ts`.
3. Run `worker.ts`, for example `tsx worker.ts`.
4. If you wait long enough, it will stop printing "running".