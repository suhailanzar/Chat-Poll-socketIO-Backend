import mongoose ,{Schema,Document} from 'mongoose'

export interface UserDocument extends Document{
    username:string
    email:string
    password:string
   
  }

const UserSchema: Schema<UserDocument> = new Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String },

});



export const UserModel=mongoose.model<UserDocument>('user',UserSchema)