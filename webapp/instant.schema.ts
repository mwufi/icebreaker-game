// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/admin";

const _schema = i.schema({
  // We inferred 1 attribute!
  // Take a look at this schema, and if everything looks good,
  // run `push schema` again to enforce the types.
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    profileComments: i.entity({
      authorHref: i.string().optional(),
      authorName: i.string().optional(),
      authorTagline: i.string().optional(),
      bodyHtml: i.string().optional(),
      bodyText: i.string().optional(),
      createdAt: i.number(),
      dateText: i.string().optional(),
      likes: i.number(),
      profile: i.string().optional(),
    }),
    profiles: i.entity({
      createdAt: i.number(),
      name: i.string().unique().indexed(),
      profilePicUrl: i.string().optional(),
      profileRawHtml: i.string().optional(),
      profileText: i.string().optional(),
      tagline: i.string().optional(),
    }),
  },
  links: {
    profileCommentsAuthor: {
      forward: {
        on: "profileComments",
        has: "one",
        label: "author",
        onDelete: "cascade",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "commented",
      },
    },
    profileCommentsParentProfile: {
      forward: {
        on: "profileComments",
        has: "one",
        label: "parentProfile",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "comments",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
