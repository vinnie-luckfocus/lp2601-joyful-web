#!/bin/bash

# Epic 01 Automated Test Suite Runner
# Joyful Baseball League - Admin Data Entry

set -e

echo "========================================"
echo "Epic 01 Test Suite"
echo "Joyful Baseball League"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Warning: DATABASE_URL not set, using default${NC}"
    export DATABASE_URL="postgresql://localhost:5432/joyful_baseball"
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}Warning: JWT_SECRET not set, using test secret${NC}"
    export JWT_SECRET="test-secret-key-for-testing-only"
fi

echo "Environment:"
echo "  DATABASE_URL: $DATABASE_URL"
echo "  JWT_SECRET: [hidden]"
echo ""

# Track results
BACKEND_PASSED=0
FRONTEND_PASSED=0
INTEGRATION_PASSED=0

# Run Backend Tests
echo "========================================"
echo "Running Backend Tests..."
echo "========================================"
cd /Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend
if npm test -- --config ../tests/backend/jest.config.js --coverage 2>&1; then
    echo -e "${GREEN}✓ Backend tests passed${NC}"
    BACKEND_PASSED=1
else
    echo -e "${RED}✗ Backend tests failed${NC}"
fi
echo ""

# Run Frontend Tests
echo "========================================"
echo "Running Frontend Tests..."
echo "========================================"
cd /Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/frontend
if npm test 2>&1; then
    echo -e "${GREEN}✓ Frontend tests passed${NC}"
    FRONTEND_PASSED=1
else
    echo -e "${RED}✗ Frontend tests failed${NC}"
fi
echo ""

# Run Integration Tests
echo "========================================"
echo "Running Integration Tests..."
echo "========================================"
cd /Users/vinniechow/Projects/luckfocus/lp2601-joyful-web/backend
if npx jest --config ../tests/backend/jest.config.js --testPathPattern=integration 2>&1; then
    echo -e "${GREEN}✓ Integration tests passed${NC}"
    INTEGRATION_PASSED=1
else
    echo -e "${RED}✗ Integration tests failed${NC}"
fi
echo ""

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
if [ $BACKEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}✓ Backend Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Backend Tests: FAILED${NC}"
fi

if [ $FRONTEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}✓ Frontend Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Frontend Tests: FAILED${NC}"
fi

if [ $INTEGRATION_PASSED -eq 1 ]; then
    echo -e "${GREEN}✓ Integration Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Integration Tests: FAILED${NC}"
fi
echo ""

TOTAL_PASSED=$((BACKEND_PASSED + FRONTEND_PASSED + INTEGRATION_PASSED))
if [ $TOTAL_PASSED -eq 3 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
