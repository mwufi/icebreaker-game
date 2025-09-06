// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/admin";

const rules = {
  profiles: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.linkedUser",
      delete: "false"
    }
  },
  $users: {
    allow: {
      view: "true"
    }
  },
  inviteLink: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.inviter.linkedUser",
      delete: "false"
    }
  },
  profileComments: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.author.linkedUser",
      delete: "auth.id == data.author.linkedUser"
    }
  }
} satisfies InstantRules;

export default rules;
