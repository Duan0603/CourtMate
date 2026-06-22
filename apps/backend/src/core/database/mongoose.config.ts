export const mongooseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://root:examplepassword@localhost:27017/courtmate?authSource=admin',
};
