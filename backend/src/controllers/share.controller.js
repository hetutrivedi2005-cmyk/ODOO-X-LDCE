const shareService = require('../services/share.service');

/**
 * Creates a public share link for a trip.
 */
const createShare = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { expiresAt } = req.body;

    const share = await shareService.createShare(tripId, req.user.id, { expiresAt });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const shareUrl = `${clientUrl}/shared/${share.shareToken}`;

    return res.status(201).json({
      success: true,
      data: {
        share: {
          id: share.id,
          shareToken: share.shareToken,
          shareUrl,
          expiresAt: share.expiresAt,
          createdAt: share.createdAt
        }
      }
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Lists all active public share links for a trip.
 */
const listShares = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const shares = await shareService.listShares(tripId, req.user.id);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const formattedShares = shares.map(share => ({
      id: share.id,
      shareToken: share.shareToken,
      shareUrl: `${clientUrl}/shared/${share.shareToken}`,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        shares: formattedShares
      }
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Revokes a public share link.
 */
const revokeShare = async (req, res, next) => {
  try {
    const { tripId, shareId } = req.params;

    await shareService.revokeShare(tripId, req.user.id, shareId);

    return res.status(200).json({
      success: true,
      message: 'Share link revoked successfully'
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Fetches a shared trip's read-only data.
 * Does NOT require authentication.
 */
const getSharedTrip = async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    const trip = await shareService.getSharedTrip(shareToken);

    return res.status(200).json({
      success: true,
      data: {
        trip
      }
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

module.exports = {
  createShare,
  listShares,
  revokeShare,
  getSharedTrip
};
