import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/fleet/redux/features/authApiSlice";

interface FormState {
  username: string;
  email: string;
  password: string;
}

export default function useRegister() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  
  const [formData, setFormData] = useState<FormState>({
    username: "",
    email: "",
    password: "",
  });

  const { username, email, password } = formData;

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    register({ username, email, password })
      .unwrap()
      .then((data) => {
        // toast.success("Please check email to verify account");
        router.push("/auth/id");
      })
      .catch((err) => {
        const msgs = err["data"]["msg"];
        if (Array.isArray(msgs)) {
          msgs.forEach((msg) => {
            // toast.error(msg);
          });
        } else {
          // toast.error(msgs);
        }
      });
  };

  return {
    username,
    email,
    password,
    isLoading,
    onChange,
    onSubmit,
  };
}
