import fs from 'node:fs';
import { sql } from '@vercel/postgres';
import { S3 } from '@aws-sdk/client-s3';
import xss from 'xss';
import slugify from 'slugify';
// import sql from 'better-sqlite3';

const s3 = new S3({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// const db = await sql`SELECT * FROM meals`;
// console.log(db);

export async function getMeals() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = await sql`SELECT * FROM meals`;
    return result.rows;
  } catch (error) {
    return { error: 'Failed to retrieve meals' };
  }
}

// export async function getMeals() {
//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   // throw new Error('Something went wrong');
//   return db.prepare('SELECT * FROM meals').all();
// }

export async function getMeal(slug) {
  try {
    const result = await sql`SELECT * FROM meals WHERE slug = ${slug}`;
    return result.rows[0];
  } catch (error) {
    return { error: 'Failed to retrieve meal' };
  }
}

// export function getMeal(slug) {
//   return db.prepare('SELECT * FROM meals WHERE slug =?').get(slug);
// }

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split('.').pop();
  const fileName = `${meal.slug}.${extension}`;

  const bufferedImage = await meal.image.arrayBuffer();

  s3.putObject({
    Bucket: 'mtabbaeatsleeprepeat',
    Key: fileName,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type,
  });

  meal.image = fileName;
  try {
    await sql`INSERT INTO meals (slug, title, image, summary, instructions, creator, creator_email)
     VALUES (${meal.slug}, ${meal.title}, ${meal.image}, ${meal.summary}, ${meal.instructions}, ${meal.creator}, ${meal.creator_email});`;
    console.log({ message: 'Meal shared successfully' });
  } catch (error) {
    return { error: 'Failed to share meal' };
  }
}
// try {
//   await sql`INSERT INTO meals (slug, title, image, summary, instructions, creator, creator_email)
//     VALUES (${meal.slug}, ${meal.title}, ${meal.image}, ${meal.summary}, ${meal.instructions}, ${meal.creator}, ${meal.creator_email});`;
//   return { message: 'Meal shared successfully' };
// } catch (error) {
//   return { error: 'Failed to share meal' };
// }

// for storing in local db

// export async function saveMeal(meal) {
//   meal.slug = slugify(meal.title, { lower: true });
//   meal.instructions = xss(meal.instructions);

//   const extension = meal.image.name.split('.').pop();

//   const fileName = `${meal.slug}.${extension}`;
//   const stream = fs.createWriteStream(`public/images/${fileName}`);
//   const bufferedImage = await meal.image.arrayBuffer();

//   stream.write(Buffer.from(bufferedImage), (error) => {
//     if (error) {
//       throw new Error('Saving  image failed');
//     }
//   });

//   meal.image = `/images/${fileName}`;

//   db.prepare(
//     `INSERT INTO meals
//     (title, summary, instructions, creator, creator_email, image, slug)
//     VALUES (
//     @title,
//     @summary,
//     @instructions,
//     @creator,
//     @creator_email,
//     @image,
//     @slug
//     )`
//   ).run(meal);
// }
