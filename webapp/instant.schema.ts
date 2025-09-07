// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  // We inferred 2 attributes!
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
    dailyConnections: i.entity({
      accepted: i.boolean(),
      date: i.date().optional(),
      otherSideAccepted: i.boolean().optional(),
      text: i.any().optional(),
    }),
    groups: i.entity({
      name: i.string().indexed(),
    }),
    inviteLink: i.entity({
      code: i.string().unique().indexed(),
      createdAt: i.number().optional(),
      fulfilledAt: i.date().optional(),
    }),
    preferences: i.entity({
      lookingFor: i.any().optional(),
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
      isAdmin: i.boolean().optional(),
    }),
  },
  links: {
    dailyConnectionsProfiles: {
      forward: {
        on: "dailyConnections",
        has: "one",
        label: "profiles",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "dailyConnections",
      },
    },
    dailyConnectionsTargetProfile: {
      forward: {
        on: "dailyConnections",
        has: "one",
        label: "targetProfile",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "potentialConnections",
      },
    },
    groupsMembers: {
      forward: {
        on: "groups",
        has: "many",
        label: "members",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "groups",
      },
    },
    inviteLinkIntendedInvitee: {
      forward: {
        on: "inviteLink",
        has: "one",
        label: "intendedInvitee",
      },
      reverse: {
        on: "profiles",
        has: "one",
        label: "intendedInite",
      },
    },
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
    preferencesProfile: {
      forward: {
        on: "preferences",
        has: "one",
        label: "profile",
      },
      reverse: {
        on: "profiles",
        has: "one",
        label: "preferences",
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
interface AppSchema extends _AppSchema { }
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
