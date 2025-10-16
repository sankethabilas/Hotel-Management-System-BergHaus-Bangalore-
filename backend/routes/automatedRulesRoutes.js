const express = require('express');
const router = express.Router();
const automatedRulesController = require('../controllers/automatedRulesController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'manager'));

// Rule CRUD
router.get('/', automatedRulesController.getAllRules);
router.get('/stats', automatedRulesController.getRuleStats);
router.get('/:id', automatedRulesController.getRuleById);
router.post('/', automatedRulesController.createRule);
router.put('/:id', automatedRulesController.updateRule);
router.delete('/:id', automatedRulesController.deleteRule);

// Testing and execution
router.post('/:id/test', automatedRulesController.testRule);
router.post('/:id/execute', automatedRulesController.executeRuleManually);

// Execution history
router.get('/executions/history', automatedRulesController.getRuleExecutions);

module.exports = router;
