import { NextApiRequest, NextApiResponse } from "next";

import { hashPassword } from "@lib/auth";
import prisma from "@lib/prisma";
import slugify from "@lib/slugify";

import { IdentityProvider } from ".prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return;
  }

  const data = req.body;
  const { email, password } = data;
  const username = slugify(data.username);

  if (!username) {
    res.status(422).json({ message: "Invalid username" });
    return;
  }

  if (!email || !email.includes("@")) {
    res.status(422).json({ message: "Invalid email" });
    return;
  }

  if (!password || password.trim().length < 7) {
    res.status(422).json({ message: "Invalid input - password should be at least 7 characters long." });
    return;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: username,
        },
        {
          email: email,
        },
      ],
    },
  });

  if (existingUser) {
    const message: string =
      existingUser.email !== email ? "Username already taken" : "Email address is already registered";

    return res.status(409).json({ message });
  }

  const hashedPassword = await hashPassword(password);

  // TODO: clean up the member invitation workflow so that upsert can be dropped
  // here. Inviting a team member should not create a new user until the invitee
  // explicitly creates an account.
  await prisma.user.upsert({
    where: { email },
    update: {
      username,
      password: hashedPassword,
      emailVerified: new Date(Date.now()),
      identityProvider: IdentityProvider.CAL,
    },
    create: {
      username,
      email,
      password: hashedPassword,
      identityProvider: IdentityProvider.CAL,
    },
  });

  res.status(201).json({ message: "Created user" });
}
