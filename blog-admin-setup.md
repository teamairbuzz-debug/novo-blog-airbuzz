# Airbuzz Blog Admin Setup

This adds a simple browser editor at:

https://blog.airbuzz.co/admin/

Editors can create, edit, review, and publish posts there. They do not need to open GitHub or Netlify day to day. The CMS writes content back to GitHub, and Netlify rebuilds the blog automatically.

## Files to add

Copy these files into the blog repository:

- `admin/index.html`
- `admin/config.yml`

If the blog uses a `public` or `static` folder for files served from the site root, place the `admin` folder inside that folder instead.

Common examples:

- Astro: `public/admin/index.html` and `public/admin/config.yml`
- Next.js: `public/admin/index.html` and `public/admin/config.yml`
- Eleventy: usually `admin/index.html` or inside the configured input folder
- Hugo: `static/admin/index.html` and `static/admin/config.yml`

## Adjust the content paths

Open `admin/config.yml` and adjust these values to match the repository:

```yml
folder: "content/posts"
media_folder: "static/uploads"
public_folder: "/uploads"
```

Use the folder where current blog post markdown files live. For example, if posts are in `src/content/blog`, change `folder` to:

```yml
folder: "src/content/blog"
```

If the default Git branch is not `main`, change:

```yml
branch: main
```

## One-time Netlify setup

In Netlify, open the site settings for `blog.airbuzz.co`.

1. Enable Identity.
2. Set registration to invite-only.
3. Enable Git Gateway.
4. Connect Git Gateway to the blog GitHub repository.
5. Invite editor email addresses under Identity users.
6. Deploy the site.

After that, editors go to `https://blog.airbuzz.co/admin/`, log in, create a post, and publish.

## Recommended publishing flow

The config uses `publish_mode: editorial_workflow`, which means posts move through draft, review, and ready states before publishing. This keeps accidental posts from going live immediately.

Set `Draft` to `false` before publishing if the blog template respects a `draft` field.

## Important note

Netlify Identity is deprecated, but Netlify still documents Git Gateway with Identity as a supported Decap CMS path. For a longer-term setup, keep the same `admin/config.yml` and replace the authentication layer with a maintained OAuth service for Decap CMS when needed.
