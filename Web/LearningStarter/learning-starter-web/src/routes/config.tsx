import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
//import { Route, Routes as Switch, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/landing-page/landing-page";
import { NotFoundPage } from "../pages/not-found";
import { useUser } from "../authentication/use-auth";
import { UserPage } from "../pages/user-page/user-page";
import { PageWrapper } from "../components/page-wrapper/page-wrapper";
import { routes } from "./index";
import { DiscussionPage } from "../pages/discussion-page";
import { WarningPage } from "../pages/warning-page/warning-page";
import { UserProfilePage } from "../pages/user-profile/user-profile";
import { UserDiscussionPage } from "../pages/user-discussion-page/user-discussion-page";
import { MyInvitesPage } from "../pages/my-invites-page";
import { WarningInvitePage } from "../pages/warning-page/warning-invite";
import { WarningBannedPage } from "../pages/warning-page/warning-banned";
import { CreateDiscussionPage } from "../pages/create-discussion-page";
import { DiscussionSettingsPage } from "../pages/discussion-settings-page";
import { WarningLimitPage } from "../pages/warning-page/warning-limit";
import { Switch } from "@mantine/core/lib/components/Switch";

//This is where you will tell React Router what to render when the path matches the route specified.
export const AppRoutes = () => {
  //Calling the useUser() from the use-auth.tsx in order to get user information
  const user = useUser();
  return (
    <>
      {/* The page wrapper is what shows the NavBar at the top, it is around all pages inside of here. */}

      <PageWrapper>
        <Routes>
          {/* When path === / render LandingPage */}
          <Route path={routes.home} element={<LandingPage />} />
          {/* When path === /iser render UserPage */}
          <Route path={routes.user} element={<UserPage />} />
          {/* Going to route "localhost:5001/" will go to homepage */}
          <Route path={routes.root} element={<Navigate to={routes.home} />} />
          <Route path={routes.discussionPage} element={<DiscussionPage />} />
          <Route path={routes.warning} element={<WarningPage />} />
          <Route path={routes.userProfile} element={<UserProfilePage />} />
          <Route
            path={routes.userDiscussionPage}
            element={<UserDiscussionPage />}
          />

          <Route path={routes.home} element={<LandingPage />} />
          <Route path={routes.user} element={<UserPage />} />
          <Route path={routes.discussionPage} element={<DiscussionPage />} />
          <Route path={routes.warning} element={<WarningPage />} />
          <Route path={routes.userProfile} element={<UserProfilePage />} />
          <Route
            path={routes.userDiscussionPage}
            element={<UserDiscussionPage />}
          />
          <Route path={routes.myInvites} element={<MyInvitesPage />} />
          <Route path={routes.warningInvite} element={<WarningInvitePage />} />
          <Route path={routes.warningBanned} element={<WarningBannedPage />} />
          <Route path={routes.warningLimit} element={<WarningLimitPage />} />
          <Route
            path={routes.createDiscussion}
            element={<CreateDiscussionPage />}
          />
          <Route
            path={routes.discussionSettings}
            element={<DiscussionSettingsPage />}
          />

          {/* 404 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageWrapper>
    </>
  );
};
