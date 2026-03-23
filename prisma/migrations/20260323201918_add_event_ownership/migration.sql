-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategy" TEXT NOT NULL DEFAULT 'COUSIN_EXCHANGE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdByEmail" TEXT NOT NULL DEFAULT '',
    "budget" INTEGER NOT NULL,
    "items" INTEGER NOT NULL,
    "regDeadline" DATETIME NOT NULL,
    "revealDate" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("budget", "createdAt", "id", "items", "name", "regDeadline", "revealDate", "slug", "status", "strategy", "timezone", "updatedAt") SELECT "budget", "createdAt", "id", "items", "name", "regDeadline", "revealDate", "slug", "status", "strategy", "timezone", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
