import { redirect } from "next/navigation";

export default function MerchantRegisterRedirect() {
  // Redirect to standard registration but with merchant intent, 
  // or you could build a dedicated merchant registration here.
  redirect("/register?intent=merchant");
}
