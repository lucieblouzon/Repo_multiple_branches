import type { Core } from '@strapi/strapi';
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime-types';

const dataJson = require(path.join(process.cwd(), 'data', 'data.json'));
const { categories, authors, articles, global, about, tags, products, events, faq } = dataJson;

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions: Record<string, string[]>) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  const allPermissionsToCreate: Promise<any>[] = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

function getFileSizeInBytes(filePath: string) {
  const stats = fs.statSync(filePath);
  return stats['size'];
}

function getFileData(fileName: string) {
  const filePath = path.join('data', 'uploads', fileName);
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';
  return {
    filepath: filePath,
    originalFileName: fileName,
    size,
    mimetype: mimeType,
  };
}

async function uploadFile(file: any, name: string) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
}

async function checkFileExistsBeforeUpload(files: string[]) {
  const existingFiles: any[] = [];
  const uploadedFiles: any[] = [];

  for (const fileName of files) {
    const fileWhereName = await strapi.query('plugin::upload.file').findOne({
      where: { name: fileName.replace(/\..*$/, '') },
    });

    if (fileWhereName) {
      existingFiles.push(fileWhereName);
    } else {
      const fileData = getFileData(fileName);
      const fileNameNoExtension = fileName.split('.').shift();
      const [file] = await uploadFile(fileData, fileNameNoExtension!);
      uploadedFiles.push(file);
    }
  }
  const allFiles = [...existingFiles, ...uploadedFiles];
  return allFiles.length === 1 ? allFiles[0] : allFiles;
}

async function updateBlocks(blocks: any[]) {
  const updatedBlocks: any[] = [];
  for (const block of blocks) {
    if (block.__component === 'shared.media') {
      const uploadedFiles = await checkFileExistsBeforeUpload([block.file]);
      updatedBlocks.push({ ...block, file: uploadedFiles });
    } else if (block.__component === 'shared.slider') {
      const existingAndUploadedFiles = await checkFileExistsBeforeUpload(block.files);
      updatedBlocks.push({ ...block, files: existingAndUploadedFiles });
    } else {
      updatedBlocks.push(block);
    }
  }
  return updatedBlocks;
}

async function createEntry({ model, entry }: { model: string; entry: any }) {
  try {
    await strapi.documents(`api::${model}.${model}` as any).create({ data: entry });
  } catch (error) {
    console.error({ model, entry, error });
  }
}

async function importCategories() {
  for (const category of categories) {
    await createEntry({ model: 'category', entry: category });
  }
}

async function importTags() {
  for (const tag of tags) {
    await createEntry({ model: 'tag', entry: tag });
  }
}

async function importAuthors() {
  for (const author of authors) {
    if (author.avatar) {
      const avatar = await checkFileExistsBeforeUpload([author.avatar]);
      await createEntry({ model: 'author', entry: { ...author, avatar } });
    } else {
      await createEntry({ model: 'author', entry: author });
    }
  }
}

async function importArticles() {
  for (const article of articles) {
    const cover = await checkFileExistsBeforeUpload([`${article.slug}.jpg`]);
    const updatedBlocks = await updateBlocks(article.blocks);
    await createEntry({
      model: 'article',
      entry: { ...article, cover, blocks: updatedBlocks, publishedAt: Date.now() },
    });
  }
}

async function importProducts() {
  for (const product of products) {
    await createEntry({
      model: 'product',
      entry: { ...product, publishedAt: Date.now() },
    });
  }
}

async function importEvents() {
  for (const event of events) {
    await createEntry({
      model: 'event',
      entry: { ...event, publishedAt: Date.now() },
    });
  }
}

async function importGlobal() {
  const favicon = await checkFileExistsBeforeUpload(['favicon.png']);
  const shareImage = await checkFileExistsBeforeUpload(['default-image.png']);
  return createEntry({
    model: 'global',
    entry: {
      ...global,
      favicon,
      publishedAt: Date.now(),
      defaultSeo: { ...global.defaultSeo, shareImage },
    },
  });
}

async function importAbout() {
  const updatedBlocks = await updateBlocks(about.blocks);
  await createEntry({
    model: 'about',
    entry: { ...about, blocks: updatedBlocks, publishedAt: Date.now() },
  });
}

async function importFaq() {
  await createEntry({
    model: 'faq',
    entry: { ...faq, publishedAt: Date.now() },
  });
}

async function importSeedData() {
  await setPublicPermissions({
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    author: ['find', 'findOne'],
    global: ['find', 'findOne'],
    about: ['find', 'findOne'],
    tag: ['find', 'findOne'],
    product: ['find', 'findOne'],
    event: ['find', 'findOne'],
    faq: ['find', 'findOne'],
  });

  await importCategories();
  await importTags();
  await importAuthors();
  await importArticles();
  await importProducts();
  await importEvents();
  await importGlobal();
  await importAbout();
  await importFaq();
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    const shouldImportSeedData = await isFirstRun();

    if (shouldImportSeedData) {
      try {
        console.log('Setting up the template...');
        await importSeedData();
        console.log('Ready to go');
      } catch (error) {
        console.log('Could not import seed data');
        console.error(error);
      }
    }
  },
};
