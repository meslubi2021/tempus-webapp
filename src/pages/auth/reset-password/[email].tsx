import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";
import React, { useState } from "react";
import CookieConsent from "react-cookie-consent";
import { Button } from "../../../components/Button";
import { TextField } from "../../../components/Forms/TextField";
import { Heading } from "../../../components/Heading";
import UserController from "../../../controllers/UserController";
import Image from "next/image";

export default function ResetPassword({ defaultEmail }) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState(null);
  const [errors, setErrors] = useState(null);

  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleKeydownEvent = async (e) => {
    if (!(e.key === "Enter") || email.length == 0 || password.length == 0)
      return;

    await submit();
  };
  const submit = async () => {
    setLoading(true);
    setSuccess(false);

    const response = await UserController.resetPassword(email, code, password);

    if (response.errors) {
      setLoading(false);
      setErrors(() => response.errors);
      return;
    }

    setCookie(null, "token", response, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    setSuccess(true);
    router.push("/");
  };
  return (
    <>
      <Head>
        <title>Tempus | Password Reset</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        <div className="login flex items-center bg-white">
          <div className="w-2/3 grid grid-cols-1 gap-6  m-auto">
            <Heading size={"h2"} weight={"bold"} className="">
              Nova Password
            </Heading>

            <p>
              Enviamos um email com o código que lhe permitirá introduzir uma
              nova password. Por favor verifique os seus emails.
            </p>

            <TextField
              name="email"
              type="email"
              error={errors?.email || null}
              onChange={setEmail}
              label="Email"
              value={email}
              onKeyDown={handleKeydownEvent}
            />

            <TextField
              name="code"
              type="number"
              error={errors?.code || null}
              onChange={setCode}
              label="Código"
              value={code}
              onKeyDown={handleKeydownEvent}
            />

            <TextField
              name="password"
              type="password"
              error={errors?.password || null}
              onChange={setPassword}
              label="Nova Password"
              value={password}
              onKeyDown={handleKeydownEvent}
            />

            <Button
              onClick={submit}
              loading={loading}
              color={success ? "success" : "primary"}
              disabled={email.length == 0}
              className="md:w-1/4"
            >
              Submeter
            </Button>
            <div className="group flex flex-col gap-2">
              <Link href="/auth/login">
                <p className="cursor-pointer">
                  <span className="underline text-primary">Voltar </span>
                </p>
              </Link>
            </div>
            <CookieConsent
              style={{ background: "#F5F7FF", color: "#3D3D3D" }}
              buttonText="Compreendi!"
            >
              Este website utiliza cookies para melhorar a experiência de
              utilização
            </CookieConsent>
          </div>
        </div>
        <div
          className="md:items-center md:justify-center hidden md:flex md:flex-col gap-7"
          style={{
            background:
              "radial-gradient(51.04% 48.52% at 48.96% 51.48%, #17BDBF 0%, rgba(76, 91, 223, 0.54) 100%)",
          }}
        >
          <Image
            src={"/reset_password_background.png"}
            width={600}
            height={600}
          />
        </div>{" "}
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const { email } = ctx.query;
  return {
    props: { defaultEmail: email },
  };
}
