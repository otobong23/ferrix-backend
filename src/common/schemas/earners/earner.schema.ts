import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EarnerDocument = Earner & Document;

@Schema({ timestamps: true }) // timestamps MUST be here
export class Earner {

  @Prop({ required: true })
  userID!: string;

  @Prop({ enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status?: 'pending' | 'completed' | 'failed'

  @Prop({ type: Number, required: true })
  daily_rate!: number;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;
}

export const EarnerSchema = SchemaFactory.createForClass(Earner);

EarnerSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 60 * 10 }
);