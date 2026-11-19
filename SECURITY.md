# Security Policy

## Supported versions

Only the latest commit on `main` is supported. That is the version running on
https://moggel.ch, and it is the only one that receives security fixes.

## Reporting a vulnerability

Please do not open a public issue or pull request for a security problem.

Report it privately through GitHub instead:
[Report a vulnerability](https://github.com/Ratzifutzi/moggel.ch/security/advisories/new)

A useful report includes:

- what the problem is and what an attacker could do with it,
- the affected URL, route or file,
- steps to reproduce it, or a proof of concept.

## What to expect

This is a small project maintained in spare time, so these are best-effort
targets:

- an acknowledgement within 7 days,
- an assessment, and a plan if the report is confirmed, within 14 days,
- a note when the fix is live, and credit in the advisory if you would like it.

## Disclosure

Please keep the details private until a fix is released, or until 90 days have
passed since your report, whichever comes first.

## Scope

In scope: the code in this repository and the site at https://moggel.ch.

Out of scope:

- third-party services the site relies on (report those to their vendors),
- denial of service and other volume-based attacks,
- social engineering,
- scanner output without a demonstrated impact.

When testing, do not access or change data that is not yours, and do not
degrade the site for other visitors.
