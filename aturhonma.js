const gracelyConfig = {
  // Config Version: 2.2.1 (Pure JS Decrypted)
  blockedUrlPatterns: [
    "*academia.edu/logout*",
    "*beinsports.com/api/logout*",
    "*passport.bilibili.tv/x/intl/passport-login/web/login/exit*",
    "*bypassgpt.ai/api/auth/signout*",
    "*capcut.com/passport/web/logout*",
    "*chatgpt.com/auth/logout*",
    "*chatgpt.com/backend-api/accounts/logout_all*",
    "*UNUSEDclaude.ai/logout*",
    "*codecademy.com/sign_out*",
    "*coursera.org/api/logoutSsr*",
    "*crunchyroll.com/logout*",
    "*curiositystream.com/signout*",
    "*datacamp.com/users/sign_out*",
    "*deepl.com/account?request_type=jsonrpc&il=en&method=logout*",
    "*duolingo.com/logout*",
    "*epidemicsound.com/logout*",
    "*everand.com/logout*",
    "*flaticon.com/profile/login/out*",
    "*freepik.com/oauth-logout*",
    "*github.com/logout*",
    "*grammarly.com/v3/logout*",
    "*iloveimg.com/logout*",
    "*ilovepdf.com/logout*",
    "*iq.com/intl/user/logout.action*",
    "*leonardo.ai/api/auth/signout*",
    "*linkedin.com/uas/logout*",
    "*masterclass.com/sign_out*",
    "*medium.com/m/signout*",
    "*motionarray.com/api/logout*",
    "*musicbed.com/api/auth/logout*",
    "*netflix.com/SignOut*",
    "*netflix.com/manageaccountaccess*",
    "*netflix.com/ManageDevices*",
    "*netflix.com/account*",
    "*notion.com/front-api/cookie-sync?logout=true&original_url=/logout*",
    "*perplexity.ai/rest/user/sign-out-all*",
    "*perplexity.ai/api/auth/signout*",
    "*primevideo.com/region/eu/gp/flex/video/ref=atv_nb_sign_out?action=sign-out*",
    "*quizlet.com/logout*",
    "*rawpixel.com/user/logout*",
    "*scholarcy.com/logout*",
    "*typeset.io/accounts/logout*",
    "*scribd.com/logout*",
    "*semrush.com/sso/logout*",
    "*sider.ai/signOut*",
    "*skillshare.com/en/logout*",
    "*slideshare.net/logout*",
    "*tradingview.com/accounts/logout*",
    "*monica.im/api/user/logout*",
    "*vidio.com/users/logout*",
    "*neilpatel.com/api/logout*",
    "*udemy.com/user/logout*",
    "*voice.ai/logout*",
    "*netflix.com/ManageProfiles*",
    "*netflix.com/profiles/manage*",
    "*billing.stripe.com/p/session*",
    "*invoice.stripe.com/i*",
    "*brilliant.org/account/logout*",
    "*cursor.com/api/auth/logout*",
    "*iconscout.com/api/v2/logout*",
    "*symfonycasts.com/logout*",
    "*api.UNUSEDclaude.ai/api/organizations/*/end_subscription*",
    "*busuu.com/en/logout*",
    "*coohom.com/api/account/oauth/token/logout*",
    "*UNUSEDgetmerlin.in/api/auth/signout*",
    "*relume.io/app/logout*",
    "*splice.com/accounts/sign-out*",
    "*vectorizer.ai/log_out*",
    "*api.picsart.com/users/update-password*",
    "*picsart.com/settings*",
    "*hotstar.com/api/internal/bff/v2/pages/1156/spaces/2565/widgets/9699?action=logoutThisDevice*",
    "*hotstar.com/api/internal/bff/v2/pages/1156/spaces/2565/widgets/9699?action=logoutOtherDevice*",
    "*chatgpt.com/backend-api/subscriptions/update*",
    "*netflix.com/accountowner/*",
    "*pay.openai.com*",
    "*chatgpt.com/backend-api/settings/user*",
    "*UNUSEDchatgpt.com/backend-api/me*",
    "*chatgpt.com/backend-api/accounts/mfa_info*",
    "*chatgpt.com/backend-api/gizmo_creator_profile*",
    "*chatgpt.com/backend-api/upgrade_invites*",
    "*chatgpt.com/backend-api/accounts/deactivate*",
    "*chatgpt.com/backend-api/conversations?offset=0&limit=28&order=deleted*",
    "*chatgpt.com/api/auth/signin/login-web?connection=Username-Password-Authentication&login_hint=*",
    "*auth.you.com/v1/auth/logout*",
    "*you.com/api/payments/orders/subscriptions/portal*",
    "*checkout.you.com/p/session*",
    "*you.com/settings/*",
    "*chatgpt.com/backend-api/accounts/*/users/owner_count*",
    "*chatgpt.com/backend-api/accounts/*/invites*",
    "*chatgpt.com/admin*",
    "*chatgpt.com/backend-api/accounts/*/users?offset=0&limit=25&query=*",
    "*chatgpt.com/backend-api/gizmos/snorlazzzzzzzzzzzzzzzzzzzzz/upsert*",
    "*coursehero.com/logout*",
    "*coursehero.com/account/settings*",
    "*sora.com/auth/logout*",
    "*udemy.com/cart*",
    "*udemy.com/payment*",
    "*auth.vyro.ai/apis/v1/auth/other/logout*",
    "*default.any-amer.prd.api.max.com/users/registration/changePassword*",
    "*auth.max.com/account*",
    "*udemy.com/user/edit-profile*",
    "*iask.ai/users/log_out*",
    "*perplexity.ai/settings/account*",
    "*api.churnkey.co/v1/api/orgs/*",
    "*deepl.com/subscriptions?request_type=jsonrpc&il=en&method=cancelSubscription*",
    "*deepl.com/subscriptions?request_type=jsonrpc&il=en&method=estimateSubscriptionUpdate*",
    "*cursor.com/api/dashboard/set-hard-limit*",
    "*api.brain.fm/v2/payments/disable-subscription-auto-renew*",
    "*api.brain.fm/v2/users/*/update-email*",
    "*tradingview.com/api/v1/charts/delete*",
    "*udemy.com/user/manage-subscriptions*",
    "*udemy.com/user/edit-payment-methods*",
    "*udemy.com/dashboard/purchase-history*",
    "*scispace.com/accounts/logout*",
    "*w.deepl.com/teams?request_type=jsonrpc&il=en&method=sendInvitationEmail*",
    "*clipto.com/clipto-api/account/logout*",
    "*adaptedmind.com/logout*",
    "*chat.sonus.ai/*?logout=*",
    "*rubiks.ai/*?logout=*",
    "*notion.so/api/v3/enableTeams*",
    "*api.curiositystream.com/v1/subscriptions/cancel*",
    "*UNUSEDclaude.ai/upgrade/*",
    "*freepik.com/user/api/me/save-userdata*",
    "*udemy.com/user/edit-account*",
    "*scispace.com/account*",
    "*cursor.com/api/auth/sessions/revoke*",
    "*api.bilibili.tv/x/intl/member/web/profile/update*",
    "*freepik.com/user/me*",
    "*netflix.com/accountowner/addextramember*",
    "*blackbox.ai/manage-subscriptions*",
    "*flaticon.com/profile/my_subscriptions*",
    "*epidemicsound.com/api/payment/v3/workspaces/*/account/*",
    "*figma.com/api/session/logout/*",
    "*elements.envato.com/data-api/page/sign-out-page*",
    "*elements.envato.com/sign-out*",
    "*UNUSEDclaude.ai/api/account?statsig_hashing_algorithm=djb2*",
    "*app.leonardo.ai/settings*",
    "*investing.com/members-admin/settings-close-account*",
    "*netflix.com/settings/profile/edit*",
    "*trae.ai/cloudide/api/v3/trae/Logout*",
    "*tradingview.com/settings*",
    "*udemy.com/api-2.0/users/instructor-profile/me*",
    "*chatgpt.com/auth/enroll_mfa*",
    "*drive-thru.duolingo.com*",
    "*tradingview.com/pricing*",
    "*accounts.x.ai/account*",
    "*UNUSEDelicit.com/api/auth/signout*",
    "*registerdisney.go.com/*/logout*",
    "*auth.tradingview.com/accounts/tvd/connect/*",
    "*UNUSEDclaude.ai/settings/billing*",
    "*tradingview.com/api/v1/user/profile/settings*",
    "*tradingview.com/accounts/remove_userpic*",
    "*tradingview.com/api/v1/users/anonymize*",
    "*slidesgo.com/my-users*",
    "*prezi.com/settings*",
    "*slidesgo.com/profile/subscription*",
    "*figma.com/api/teams/create*",
    "*figma.com/api/team_join_link*",
    "*figma.com/api/invites*",
    "*notegpt.io/api/v2/payments/unsubscribe*",
    "*vidio.com/dashboard/setting*",
    "*payment.api.speechify.com/subscriptions/cancelSubscription*",
    "*music.apple.com/us/account/settings*",
    "*freepik*haehaee23*",
    "*figma.com/files/team/*/team-admin-console/members*",
    "*scispace.com/pricing*",
    "*app.speechify.com/settings*",
    "*tradingview.com/api/v1/symbols_list/custom/*",
    "*placeit.net/cancel*",
    "*canva.com/_ajax/csrf3/logout*",
    "*canva.com/_ajax/logout*",
    "*mermaidchart.com/app/user/billing*",
    "*iconscout.com/api/v2/auth/change-email*",
    "*iconscout.com/api/v2/auth/subscriptions/*/cancel*",
    "*blackbox.ai/api/credits/get*",
    "*chutes.ai/app/api?/delete-api-key*"
  ],
  urls: {
    profileIcon: "https://draft.gracely.my.id/assets/halo/halooo.png",
    tutorial: "https://draft.gracely.my.id/tutorial.html",
    purchase: "https://draft.gracely.my.id/premium.html",
    onInstallHomepage: "https://www.instagram.com/petrusperdana1/",
    onInstallSocial: "https://draft.gracely.my.id/extension.html",
    onUninstall: "https://petrus.gracely.my.id/p/ruang-syahdu.html",
    onGuardMissing: "https://draft.gracely.my.id/guardrequired.html",
    onLogoutBlock: "https://draft.gracely.my.id/blocked.html",
    onLoggedOutRedirect: "https://draft.gracely.my.id/login.html",
    onFreeUserRedirect: "https://draft.gracely.my.id/premium.html",
    onGuardUninstallRedirect: "https://draft.gracely.my.id/"
  },
  debugModeEnabled: true,
  notifications: {
    useSupabase: true,
    announcement: {
      enabled: true,
      id: "info-html-nov-2025",
      html: "<div class='notificationModal-content'><i class='fa fa-times close-icon' id='notification-close'></i> <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Informasi</h2> <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'> <p style='margin: 6px 0; font-size: 14px;'><b>Web Portal</b>: draft.gracely.my.id/</p> <p style='margin: 6px 0; font-size: 14px;'><b>My Blog</b>: petrussiahaan.blogspot.com</p> </div> <div style='border: 2px dashed #666666; padding: 8px 10px; border-radius: 8px; background: #f5f5f5; margin-bottom: 12px;'> <p style='margin: 0; text-align: center; color: #333333; font-size: 13px;'>Jika bukan TUHAN yang menolong aku,</p> <p style='margin: 0; text-align: center; color: #333333; font-size: 13px;'>nyaris aku diam di tempat sunyi.</p> <p style='margin: 0; text-align: center; color: #333333; font-size: 13px;'><b>Mazmur 94 : 17</b> 😊🙏</p> </div><button class='ud-main-btn' id='notification-ok'>OK Lae</button></div>"
    },
    folderInfo: {
      "chatgpt-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>ChatGPT</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p style='text-align: center;'><img src="https://us1.discourse-cdn.com/openai1/original/4X/7/0/1/701493b167007f5ab689eda8f388260e7390abc1.png" width="90%"></p>
                 <p style='margin: 6px 0; font-size: 14px;'>Jika kamu mengalami pesan error: <b>"Something went wrong while generating the response"</b>, cukup hapus cookie dan cache pada browser yang kamu gunakan.</p>
                 <p style='margin: 6px 0; font-size: 14px;'>Jika kamu mengalami pesan error: <b>"Detected unusual activity"</b>, silahkan gunakan akun lain atau gunakan alternatif seperti <b>Sider/NoteGPT/You/Merlin</b>.</p>
                 <p style='margin: 6px 0; font-size: 14px;'>Jika model o1 sedang limit, kamu tetap dapat menggunakan model 4o.</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "freepik-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Informasi</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p>Jika kamu ingin mengunduh file <b>.mv</b> atau <b>.mp4</b>, gunakan <b>Freepik 2-3</b></p>
                 <p><b>Freepik 1</b> (Server 1-10 digunakan untuk mengunduh tipe file jpg, png, tidak untuk mengunduh icon / video)</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "canva-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Informasi</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p>Silakan undang email pribadi kamu untuk bergabung dengan team Canva. Jika sudah penuh, mohon laporkan melalui Telegram.</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "procapcut-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Informasi</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p>CapCut pada Pro menggunakan CapCut Teams. Fitur Pro dapat dinikmati melalui manual login pada mobile &amp; desktop app CapCut.</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "canva-pro-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Informasi</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p>Silakan undang email pribadi kamu untuk bergabung dengan team Canva. Jika sudah penuh, mohon laporkan melalui Telegram.</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "getmerlin.in-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Merlin AI</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p><b>22/01/2026</b> Merlin sudah diperbarui.</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "claude-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Claude</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p><img src="https://i.ibb.co.com/Vptr5NxB/c613db4c-71ff-44f1-8110-797054a43f5e.jpg" width="90%"></p>
                 <p>Kamu tetap dapat melakukan akses ke Claude via Merlin AI [Diperbarui <b>22/01/2026</b>]</p>
               </div>
               <button class='ud-main-btn' id='notification-ok' style='background: #10a37f; color: white;'>Oke Lae</button>`
      },
      "perplexity-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Perplexity</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p>Jika Perpexity <b>tidak terlogin-login</b>, silahkan lakukan akses ulang sampai terlogin.</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "gemini-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Gemini</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p><b>Please DO NOT attempt to log in using a mobile phone or tablet.</b> For security reasons, this account is only accessible via desktop or laptop web browsers.</p>
<p><b>Mohon JANGAN mencoba masuk menggunakan ponsel atau tablet.</b> Demi alasan keamanan, akun ini hanya dapat diakses melalui browser web desktop atau laptop.</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "wetv-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>WeTV</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p>Jika WeTV tidak VIP, silahkan tunggu 5 detik lalu lakukan refresh pada browser yang kamu gunakan.</p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      },
      "prime-video-group-id": {
        html: `<i class='fa fa-times close-icon' id='notification-close'></i>
               <h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Info Prime Video</h2>
               <div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'>
                 <p>Jika Prime Video meminta PIN, masukan <b>'12345'</b></p>
               </div>
               <button class='ud-main-btn' id='notification-ok'>Oke Lae</button>`
      }
    },
  },
  maintenanceMode: {
    enabled: false,
    scheduleType: "daily",
    dailyTime: "23:54:00",
    specificDateTime: "2025-12-31T23:00:00",
    durationMinutes: 5,
    countdownMinutes: 10,
    warningTitle: "Informasi Maintenance",
    warningMessage: "Layanan akan memasuki mode perbaikan dalam:",
    maintenanceTitle: "Sedang Maintenance",
    maintenanceMessage: "Mohon bersabar. Kami sedang melakukan perbaikan."
  },
  versionControl: {
    extensionName: "Gracely Extension",
    requiredExtensionVersion: "2.2",
    guardName: "Gracely Guard",
    requiredGuardVersion: "1.0.3",
    onVersionMismatchUrl: "https://draft.gracely.my.id/update.html",
    sharedVerificationCode: "Mazmur_118:13-14",
    updateUrl: "https://draft.gracely.my.id/dashboard.html",
    updateMessageHTML: "<div class='notificationModal-content'><i class='fa fa-times close-icon' id='notification-close'></i><h2 style='margin: 0 0 16px 0; text-align: center; color: #2c3e50; font-size: 22px; border-bottom: 3px solid #333333; padding-bottom: 8px;'>Update Required</h2><div style='background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;'><p style='margin: 6px 0; font-size: 14px;'> Versi <b>Gracely Extension</b> dan <b>Gracely Guard</b> Anda sudah usang.</p></div><div style='border: 2px dashed #666666; padding: 8px 10px; border-radius: 8px; background: #f5f5f5; margin-bottom: 12px;'><p style='margin: 0; text-align: center; color: #333333; font-size: 13px;'><b>Please Update Gracely Extension</b>😊🙏</p></div><div style='border: 2px dashed #666666; padding: 8px 10px; border-radius: 8px; background: #f5f5f5; margin-bottom: 12px;'><p style='margin: 0; text-align: center; color: #333333; font-size: 13px;'><b>Please Update Gracely Guard</b>😊🙏</p></div><div style='display:none;'><span id='update-countdown'>30</span></div><button class='ud-main-btn' id='notification-ok'>OK Lae</button></div>"
  }
};
