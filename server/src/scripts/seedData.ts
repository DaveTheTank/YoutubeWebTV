import mongoose from 'mongoose';
import { Channel } from '../models/Channel';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tube-tv');

    await Channel.deleteMany({}); // Bestehende Daten löschen

    const channels = [
      {
        name: "Lofi Music",
        description: "Entspannende Lofi Musik",
        category: "Musik",
        source: "YOUTUBE_PLAYLIST",
        sourceId: "PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo",
      },
      {
        name: "Classic Rock",
        description: "Die besten Rock Klassiker",
        category: "Musik",
        source: "YOUTUBE_PLAYLIST",
        sourceId: "PLNxOe-buLm6cz8UQ-hyG1nm3RTNBUBv3K",
      },
      {
        name: "Nature Documentaries",
        description: "Faszinierende Naturdokumentationen",
        category: "Dokumentation",
        source: "YOUTUBE_PLAYLIST",
        sourceId: "PLNlI6CU-_dZ6Oc-KxwLqDL9tHR1z9sKlI",
      }
    ];

    await Channel.insertMany(channels);
    console.log('Testdaten erfolgreich eingefügt');
    process.exit(0);
  } catch (error) {
    console.error('Fehler beim Einfügen der Testdaten:', error);
    process.exit(1);
  }
};

seedData(); 