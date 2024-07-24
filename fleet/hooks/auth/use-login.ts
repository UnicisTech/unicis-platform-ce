import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/fleet/redux/hooks";
import { useLoginMutation } from "@/fleet/redux/features/authApiSlice";
import { setAuth } from "@/fleet/redux/features/reducers/authSlice";


export default function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    login({ email, password })
      .unwrap()
      .then((data) => {
        console.log(data);
        dispatch(setAuth());
        // toast.success("Logged in");
        router.push("/dashboard");
      })
      .catch((err) => {
        const msgs = err['data']['msg'];
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
    email,
    password,
    isLoading,
    onChange,
    onSubmit,
  };
}
