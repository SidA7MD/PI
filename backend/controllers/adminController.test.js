const { getSuperAdminStats } = require('./adminController');
const School = require('../models/School');
const User = require('../models/User');

// Mock Mongoose models
jest.mock('../models/School');
jest.mock('../models/User');

describe('AdminController - getSuperAdminStats', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    test('should calculate total unique links and revenue correctly', async () => {
        School.countDocuments.mockResolvedValue(5);
        User.countDocuments.mockResolvedValue(100);
        User.aggregate.mockResolvedValue([{ uniqueLinkedStudents: 45 }]);

        await getSuperAdminStats(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            totalSchools: 5,
            totalParents: 100,
            totalLinks: 45,
            estimatedRevenue: 4500
        });
    });

    test('should return 0 revenue if no students are linked', async () => {
        School.countDocuments.mockResolvedValue(2);
        User.countDocuments.mockResolvedValue(10);
        User.aggregate.mockResolvedValue([]);

        await getSuperAdminStats(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            totalSchools: 2,
            totalParents: 10,
            totalLinks: 0,
            estimatedRevenue: 0
        });
    });
});
