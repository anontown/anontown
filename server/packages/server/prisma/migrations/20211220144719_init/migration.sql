-- CreateEnum
CREATE TYPE "token_type" AS ENUM ('general', 'master');

-- CreateEnum
CREATE TYPE "res_type" AS ENUM ('normal', 'history', 'topic', 'fork');

-- CreateEnum
CREATE TYPE "res_delete_flag" AS ENUM ('active', 'self', 'freeze');

-- CreateEnum
CREATE TYPE "TopicType" AS ENUM ('normal', 'one', 'fork');

-- CreateTable
CREATE TABLE "clients" (
    "id" VARCHAR(64) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" VARCHAR(64) NOT NULL,
    "userId" VARCHAR(64) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "screen_name" TEXT NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" VARCHAR(64) NOT NULL,
    "key" TEXT NOT NULL,
    "type" "token_type" NOT NULL,
    "userId" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "clientId" VARCHAR(64),

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokenReqs" (
    "key" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(3) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "tokenId" VARCHAR(64) NOT NULL,

    CONSTRAINT "tokenReqs_pkey" PRIMARY KEY ("tokenId","key")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(64) NOT NULL,
    "screen_name" TEXT NOT NULL,
    "encrypted_password" TEXT NOT NULL,
    "lv" INTEGER NOT NULL,
    "res_last_created_at" TIMESTAMPTZ(3) NOT NULL,
    "count_created_res_m10" INTEGER NOT NULL,
    "count_created_res_m30" INTEGER NOT NULL,
    "count_created_res_h1" INTEGER NOT NULL,
    "count_created_res_h6" INTEGER NOT NULL,
    "count_created_res_h12" INTEGER NOT NULL,
    "count_created_res_d1" INTEGER NOT NULL,
    "topic_last_created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "point" INTEGER NOT NULL,
    "one_topic_last_created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storages" (
    "client_id" VARCHAR(64) NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "storages_pkey" PRIMARY KEY ("client_id","user_id","key")
);

-- CreateTable
CREATE TABLE "reses" (
    "id" VARCHAR(64) NOT NULL,
    "type" "res_type" NOT NULL,
    "topic_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "lv" INTEGER NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "name" TEXT,
    "content" TEXT,
    "reply_id" VARCHAR(64),
    "delete_flag" "res_delete_flag",
    "profile_id" VARCHAR(64),
    "age" BOOLEAN,
    "history_id" VARCHAR(64),
    "fork_id" VARCHAR(64),

    CONSTRAINT "reses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "res_votes" (
    "res_id" VARCHAR(64) NOT NULL,
    "order" INTEGER NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "vote" INTEGER NOT NULL,

    CONSTRAINT "res_votes_pkey" PRIMARY KEY ("res_id","order")
);

-- CreateTable
CREATE TABLE "histories" (
    "id" VARCHAR(64) NOT NULL,
    "topic_id" VARCHAR(64) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,

    CONSTRAINT "histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_tags" (
    "history_id" VARCHAR(64) NOT NULL,
    "order" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "history_tags_pkey" PRIMARY KEY ("history_id","order")
);

-- CreateTable
CREATE TABLE "msgs" (
    "id" VARCHAR(64) NOT NULL,
    "receiver_id" VARCHAR(64),
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "msgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" VARCHAR(64) NOT NULL,
    "type" "TopicType" NOT NULL,
    "title" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "age_updated_at" TIMESTAMPTZ(3) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "description" TEXT,
    "parent_id" VARCHAR(64),

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_tags" (
    "topic_id" VARCHAR(64) NOT NULL,
    "order" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "topic_tags_pkey" PRIMARY KEY ("topic_id","order")
);

-- CreateIndex
CREATE INDEX "clients_user_id_idx" ON "clients"("user_id");

-- CreateIndex
CREATE INDEX "clients_created_at_idx" ON "clients"("created_at");

-- CreateIndex
CREATE INDEX "clients_updated_at_idx" ON "clients"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_screen_name_key" ON "profiles"("screen_name");

-- CreateIndex
CREATE INDEX "profiles_userId_idx" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_created_at_idx" ON "profiles"("created_at");

-- CreateIndex
CREATE INDEX "profiles_updated_at_idx" ON "profiles"("updated_at");

-- CreateIndex
CREATE INDEX "tokens_type_idx" ON "tokens"("type");

-- CreateIndex
CREATE INDEX "tokens_userId_idx" ON "tokens"("userId");

-- CreateIndex
CREATE INDEX "tokens_created_at_idx" ON "tokens"("created_at");

-- CreateIndex
CREATE INDEX "tokens_clientId_idx" ON "tokens"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "users_screen_name_key" ON "users"("screen_name");

-- CreateIndex
CREATE INDEX "users_count_created_res_m10_idx" ON "users"("count_created_res_m10");

-- CreateIndex
CREATE INDEX "users_count_created_res_m30_idx" ON "users"("count_created_res_m30");

-- CreateIndex
CREATE INDEX "users_count_created_res_h1_idx" ON "users"("count_created_res_h1");

-- CreateIndex
CREATE INDEX "users_count_created_res_h6_idx" ON "users"("count_created_res_h6");

-- CreateIndex
CREATE INDEX "users_count_created_res_h12_idx" ON "users"("count_created_res_h12");

-- CreateIndex
CREATE INDEX "users_count_created_res_d1_idx" ON "users"("count_created_res_d1");

-- CreateIndex
CREATE INDEX "users_point_idx" ON "users"("point");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "reses_type_idx" ON "reses"("type");

-- CreateIndex
CREATE INDEX "reses_topic_id_idx" ON "reses"("topic_id");

-- CreateIndex
CREATE INDEX "reses_created_at_idx" ON "reses"("created_at");

-- CreateIndex
CREATE INDEX "reses_user_id_idx" ON "reses"("user_id");

-- CreateIndex
CREATE INDEX "reses_lv_idx" ON "reses"("lv");

-- CreateIndex
CREATE INDEX "reses_hash_idx" ON "reses"("hash");

-- CreateIndex
CREATE INDEX "reses_reply_id_idx" ON "reses"("reply_id");

-- CreateIndex
CREATE INDEX "reses_delete_flag_idx" ON "reses"("delete_flag");

-- CreateIndex
CREATE INDEX "reses_profile_id_idx" ON "reses"("profile_id");

-- CreateIndex
CREATE INDEX "reses_age_idx" ON "reses"("age");

-- CreateIndex
CREATE INDEX "reses_history_id_idx" ON "reses"("history_id");

-- CreateIndex
CREATE INDEX "reses_fork_id_idx" ON "reses"("fork_id");

-- CreateIndex
CREATE INDEX "res_votes_user_id_idx" ON "res_votes"("user_id");

-- CreateIndex
CREATE INDEX "res_votes_vote_idx" ON "res_votes"("vote");

-- CreateIndex
CREATE INDEX "histories_topic_id_idx" ON "histories"("topic_id");

-- CreateIndex
CREATE INDEX "histories_created_at_idx" ON "histories"("created_at");

-- CreateIndex
CREATE INDEX "histories_hash_idx" ON "histories"("hash");

-- CreateIndex
CREATE INDEX "histories_user_id_idx" ON "histories"("user_id");

-- CreateIndex
CREATE INDEX "history_tags_tag_idx" ON "history_tags"("tag");

-- CreateIndex
CREATE INDEX "msgs_receiver_id_idx" ON "msgs"("receiver_id");

-- CreateIndex
CREATE INDEX "msgs_created_at_idx" ON "msgs"("created_at");

-- CreateIndex
CREATE INDEX "topics_type_idx" ON "topics"("type");

-- CreateIndex
CREATE INDEX "topics_updated_at_idx" ON "topics"("updated_at");

-- CreateIndex
CREATE INDEX "topics_created_at_idx" ON "topics"("created_at");

-- CreateIndex
CREATE INDEX "topics_age_updated_at_idx" ON "topics"("age_updated_at");

-- CreateIndex
CREATE INDEX "topics_active_idx" ON "topics"("active");

-- CreateIndex
CREATE INDEX "topics_parent_id_idx" ON "topics"("parent_id");

-- CreateIndex
CREATE INDEX "topic_tags_tag_idx" ON "topic_tags"("tag");
