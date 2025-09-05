// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

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
    inviteLink: i.entity({
      code: i.string().unique().indexed(),
      createdAt: i.number().optional(),
      fulfilledAt: i.date().optional(),
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
    inviteLinkInvitees: {
      forward: {
        on: "inviteLink",
        has: "many",
        label: "invitees",
      },
      reverse: {
        on: "profiles",
        has: "one",
        label: "inviteLink",
      },
    },
    inviteLinkInviter: {
      forward: {
        on: "inviteLink",
        has: "one",
        label: "inviter",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "createdInviteLinks",
      },
    },
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
    profilesLinkedUser: {
      forward: {
        on: "profiles",
        has: "one",
        label: "linkedUser",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "odfProfile",
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
