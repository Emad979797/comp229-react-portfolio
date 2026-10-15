export function crud(Model, fields) {
  function pick(body) {
    return Object.fromEntries(fields.filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
  }
  return {
    list: async (_req, res) => res.json(await Model.find().sort({ _id: -1 })),
    read: async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Record not found' });
      res.json(doc);
    },
    create: async (req, res) => res.status(201).json(await Model.create(pick(req.body))),
    update: async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Record not found' });
      doc.set(pick(req.body));
      // Saving runs validation and the password hashing hook for user updates.
      await doc.save();
      res.json(doc);
    },
    remove: async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Record not found' });
      res.json({ message: 'Record deleted', id: doc.id });
    },
    removeAll: async (_req, res) => res.json({ deletedCount: (await Model.deleteMany({})).deletedCount }),
  };
}
