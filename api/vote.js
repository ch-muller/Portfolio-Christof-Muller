// api/vote.js
module.exports = async (req, res) => {
  global.votes = global.votes || { yes: 0, maybe: 0, no: 0 };

  if (req.method === 'POST') {
    const { option } = req.body;
    if (['yes', 'maybe', 'no'].includes(option)) {
      global.votes[option]++;
    }
    return res.status(200).json({ success: true, votes: global.votes });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ votes: global.votes });
  }

  res.status(405).json({ message: 'Method not allowed' });
};
