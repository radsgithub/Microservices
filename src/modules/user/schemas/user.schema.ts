import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class Address {
    @Prop()
    street?: string;

    @Prop()
    apartment?: string;

    @Prop()
    city?: string;

    @Prop()
    state?: string;

    @Prop()
    zipCode?: string;

    @Prop()
    country?: string;

    @Prop()
    label?: string;
}

// Schema aligned to the existing (Tanvish Couture) user documents:
// single `name` field + `passwordHash` (not firstName/lastName + password).
@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, type: String })
    name!: string;

    @Prop({ required: true, unique: true, type: String })
    email!: string;

    @Prop({ required: true, type: String })
    passwordHash!: string;

    @Prop({ type: String })
    phone?: string;

    @Prop({ default: 'user', enum: ['user', 'admin'] })
    role!: string;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ type: [Address], default: [] })
    addresses!: Address[];
}

export const UserSchema = SchemaFactory.createForClass(User);
