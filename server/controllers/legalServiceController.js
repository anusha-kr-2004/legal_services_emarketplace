const LegalService = require('../models/LegalService');

const providerRoles = ['advocate', 'mediator', 'arbitrator', 'notary', 'document_writer'];

exports.addService = async (req, res) => {
  try {
    const { title, category, description, price } = req.body;
    const provider = req.user.id;

    const newService = new LegalService({
      provider,
      title,
      category,
      description,
      price
    });
    await newService.save();

    res.status(201).json({ message: 'Service added successfully', service: newService });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const viewerRole = req.user?.role?.toLowerCase?.();
    const filter = {};

    if (viewerRole && providerRoles.includes(viewerRole)) {
      filter.provider = req.user.id;
    }

    const services = await LegalService.find(filter).populate('provider', 'name email');
    res.json(services);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await LegalService.findById(req.params.id).populate('provider', 'name email');
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const viewerRole = req.user?.role?.toLowerCase?.();
    if (viewerRole && providerRoles.includes(viewerRole)) {
      if (service.provider._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to view this service' });
      }
    }

    res.json(service);
  } catch (error) {
    res.status(500).send('Server error');
  }
};
