import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true, type: String })
    email: string | undefined;

    @Prop({ required: true, type: String })
    password!: string;
    @Prop({ type: String })
    firstName!: string;

    @Prop({ type: String })
    lastName!: string;

    @Prop({ type: String })
    phone!: string;

    @Prop({ default: 'user', enum: ['user', 'admin'] })
    role!: string;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ type: String })
    profileImage!: string;

    @Prop({ type: String })
    address!: string
}

export const UserSchema = SchemaFactory.createForClass(User);
