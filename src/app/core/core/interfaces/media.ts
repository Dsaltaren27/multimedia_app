import { Timestamp } from "rxjs";

export interface Media {
   id?: string;
  description: string;
  imageUrl: string;
  createdAt?:  Timestamp<Date> | any;
}
