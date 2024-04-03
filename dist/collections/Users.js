"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
exports.Users = {
    slug: "users",
    auth: {
        verify: {
            generateEmailHTML: function (_a) {
                var token = _a.token;
                return "<a href=\"".concat(process.env.NEXT_PUBLIC_SERVER_URL, "/verify-email?token=").concat(token, "\">Verify email</a>");
            },
        },
    },
    access: {
        read: function () { return true; },
        create: function () { return true; },
    },
    fields: [
        {
            name: "role", // "Super Admin", "Admins", "Users"
            defaultValue: "user",
            required: true,
            // admin: {
            //   condition: ({ req }) => req.user.role === "admin",
            // },
            type: "select",
            options: [
                {
                    label: "Super Admin",
                    value: "superadmin",
                },
                {
                    label: "Admin",
                    value: "admin",
                },
                {
                    label: "User",
                    value: "user",
                },
            ],
        },
    ],
};
