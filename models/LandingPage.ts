// @/models/LandingPage.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ILandingPage extends Document {
    navbar: {
        logo: string;
        menus: {
            label: string;
            link: string;
        }[];
    };

    hero: {
        title: string;
        subtitle: string;
        description: string;
        backgroundImage: string;
        cta: {
            label: string;
            link: string;
        };
    };

    about: {
        title: string;
        description: string;
        image: string;
    };

    products: {
        title: string;
        description: string;
        items: {
            name: string;
            description: string;
            price?: number;
            image: string;
            link?: string;
        }[];
    };

    footer: {
        description: string;
        socialLinks: {
            platform: string;
            url: string;
        }[];
        copyright: string;
    };

    createdAt: Date;
    updatedAt: Date;
}

const LandingPageSchema = new Schema<ILandingPage>(
    {
        navbar: {
            logo: { type: String, required: true },
            menus: [
                {
                    label: { type: String, required: true },
                    link: { type: String, required: true },
                },
            ],
        },

        hero: {
            title: { type: String, required: true },
            subtitle: { type: String, default: "" },
            description: { type: String, default: "" },
            backgroundImage: { type: String, required: true },
            cta: {
                label: { type: String, required: true },
                link: { type: String, required: true },
            },
        },

        about: {
            title: { type: String, required: true },
            description: { type: String, required: true },
            image: { type: String, required: true },
        },

        products: {
            title: { type: String, required: true },
            description: { type: String, default: "" },
            items: [
                {
                    name: { type: String, required: true },
                    description: { type: String, required: true },
                    price: { type: Number },
                    image: { type: String, required: true },
                    link: { type: String },
                },
            ],
        },

        footer: {
            description: { type: String, default: "" },
            socialLinks: [
                {
                    platform: { type: String, required: true },
                    url: { type: String, required: true },
                },
            ],
            copyright: { type: String, required: true },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ILandingPage>(
    "LandingPage",
    LandingPageSchema
);
