"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const core_1 = require("@vendure/core");
const email_plugin_1 = require("@vendure/email-plugin");
const asset_server_plugin_1 = require("@vendure/asset-server-plugin");
const plugin_1 = require("@vendure/dashboard/plugin");
const graphiql_plugin_1 = require("@vendure/graphiql-plugin");
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = +process.env.PORT || 3000;
exports.config = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        trustProxy: IS_DEV ? false : 1,
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiDebug: true,
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
            secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: false,
        migrations: [path_1.default.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    paymentOptions: {
        paymentMethodHandlers: [core_1.dummyPaymentHandler],
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {},
    plugins: [
        graphiql_plugin_1.GraphiqlPlugin.init(),
        asset_server_plugin_1.AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path_1.default.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets/',
        }),
        core_1.DefaultSchedulerPlugin.init(),
        core_1.DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        core_1.DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        email_plugin_1.EmailPlugin.init({
            devMode: true,
            outputPath: path_1.default.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: email_plugin_1.defaultEmailHandlers,
            templateLoader: new email_plugin_1.FileBasedTemplateLoader(path_1.default.join(__dirname, '../static/email/templates')),
            globalTemplateVars: {
                // The following variables will change depending on your storefront implementation.
                // Here we are assuming a storefront running at http://localhost:8080.
                fromAddress: '"example" <noreply@example.com>',
                verifyEmailAddressUrl: 'http://localhost:8080/verify',
                passwordResetUrl: 'http://localhost:8080/password-reset',
                changeEmailAddressUrl: 'http://localhost:8080/verify-email-address-change'
            },
        }),
        plugin_1.DashboardPlugin.init({
            route: 'dashboard',
            appDir: IS_DEV
                ? path_1.default.join(__dirname, '../dist/dashboard')
                : path_1.default.join(__dirname, 'dashboard'),
        }),
    ],
};
