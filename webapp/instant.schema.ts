// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  // We inferred 12 attributes!
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
    activityAnswers: i.entity({
      answerText: i.string().optional(),
      submittedAt: i.string().optional(),
    }),
    activityConversations: i.entity({}),
    activityQuestions: i.entity({
      isActive: i.boolean().optional(),
      isCreatedbySystem: i.boolean().optional(),
      questionText: i.string().unique().indexed(),
      tags: i.string().optional(),
    }),
    aiNotes: i.entity({}),
    contests: i.entity({
      name: i.string().unique().indexed(),
      revealTime: i.date().indexed(),
      showNames: i.boolean().optional(),
    }),
    dailyConnections: i.entity({
      accepted: i.boolean().optional(),
      date: i.date().indexed(),
      matchFeedback: i.string().optional(),
      otherSideAccepted: i.boolean().optional(),
      text: i.string(),
    }),
    gameCompletions: i.entity({
      audioFilePath: i.string().optional(),
      completedAt: i.date().indexed().optional(),
      gameType: i.string().indexed().optional(),
    }),
    groups: i.entity({
      name: i.string().indexed(),
    }),
    headlineItems: i.entity({
      text: i.string(),
    }),
    headlineItemVotes: i.entity({
      key: i.string().unique().indexed().optional(),
    }),
    inviteLink: i.entity({
      code: i.string().unique().indexed(),
      createdAt: i.number().optional(),
      fulfilledAt: i.date().optional(),
    }),
    preferences: i.entity({
      lookingFor: i.string().optional(),
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
      bio: i.string().optional(),
      createdAt: i.number(),
      isAdmin: i.boolean().indexed().optional(),
      lookingFor: i.string().optional(),
      name: i.string().unique().indexed(),
      personality: i.string().optional(),
      profilePicUrl: i.string().optional(),
      profileRawHtml: i.string().optional(),
      profileText: i.string().optional(),
      tagline: i.string().optional(),
      values: i.string().optional(),
      voteWeight: i.number().optional(),
    }),
    users: i.entity({
      hasSeenTutorial: i.boolean().optional(),
    }),
  },
  links: {
    activityAnswersAuthor: {
      forward: {
        on: "activityAnswers",
        has: "one",
        label: "author",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "activityAnswers",
      },
    },
    activityAnswersQuestions: {
      forward: {
        on: "activityAnswers",
        has: "many",
        label: "questions",
      },
      reverse: {
        on: "questions",
        has: "many",
        label: "activityAnswers",
      },
    },
    activityConversationsPrompt: {
      forward: {
        on: "activityConversations",
        has: "one",
        label: "prompt",
      },
      reverse: {
        on: "activityQuestions",
        has: "many",
        label: "conversations",
      },
    },
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
    gameCompletionsAudioFile: {
      forward: {
        on: "gameCompletions",
        has: "one",
        label: "audioFile",
        onDelete: "cascade",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "gameCompletions",
        onDelete: "cascade",
      },
    },
    gameCompletionsProfile: {
      forward: {
        on: "gameCompletions",
        has: "many",
        label: "profile",
      },
      reverse: {
        on: "profile",
        has: "many",
        label: "gameCompletions",
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
    headlineItemVotesItem: {
      forward: {
        on: "headlineItemVotes",
        has: "one",
        label: "item",
      },
      reverse: {
        on: "headlineItems",
        has: "many",
        label: "votes",
      },
    },
    headlineItemVotesVoter: {
      forward: {
        on: "headlineItemVotes",
        has: "one",
        label: "voter",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "votes",
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
    profileCommentsProfileLink: {
      forward: {
        on: "profileComments",
        has: "many",
        label: "profileLink",
      },
      reverse: {
        on: "profileLink",
        has: "many",
        label: "profileComments",
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
