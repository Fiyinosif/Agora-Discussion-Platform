//This is where you will declare all of your routes (the ones that show up in the search bar)
export const routes = {
  root: `/`,
  home: `/home`,
  user: `/user`,
  discussionPage: "/discussion/:id",
  warning: "/warning",
  warningInvite: "/warning/invite",
  warningBanned: "/warning/banned",
  warningLimit: "/warning/limit",
  createDiscussion: "/create-discussion",
  discussionSettings: "/discussion/:id/settings",
  userProfile: "userprofile/:id",
  userDiscussionPage: "/userDiscussions",
  myInvites: "/my-invites",
};
