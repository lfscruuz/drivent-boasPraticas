import { ApplicationError } from "@/protocols";

export function forbiddenError(): ApplicationError {
  return {
    name: "forbidden",
    message: "This room is either fully booked or you can't access it!",
  };
}