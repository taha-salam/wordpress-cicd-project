# WordPress CI/CD Quality Engineering Project

![CI/CD Pipeline](https://github.com/YOUR_USERNAME/wordpress-cicd-project/workflows/WordPress%20CI/CD%20Pipeline/badge.svg)

## 📋 Project Overview
Comprehensive Software Quality Engineering project implementing automated testing and CI/CD pipeline for WordPress.

## 👥 Team Members
- **[Your Name]** - Backend Testing & CI/CD
- **[Member 2]** - Frontend Testing
- **[Member 3]** - Documentation & Deployment

## 🛠️ Tech Stack
- **Application**: WordPress (Open-source CMS)
- **Backend Testing**: Python + Pytest + Requests
- **Frontend Testing**: Selenium/Cypress (handled by teammate)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + Docker Compose
- **Deployment**: AWS/Azure (Stage 5)

## 📁 Project Structure
```
wordpress-cicd-project/
├── .github/
│   └── workflows/
│       └── ci-cd-pipeline.yml    # GitHub Actions workflow
├── tests/
│   ├── backend/
│   │   ├── test_integration.py   # Backend API tests
│   │   └── test_unit.php         # Unit tests (optional)
│   └── frontend/                 # UI tests (teammate)
├── docs/
│   ├── SETUP.md                  # Setup instructions
│   └── TEST_PLAN.md              # Test documentation
├── docker-compose.yml            # WordPress + MySQL setup
├── requirements.txt              # Python dependencies
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Python 3.8+ installed
- Git installed

### Setup Instructions
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/wordpress-cicd-project.git
cd wordpress-cicd-project

# Start WordPress
docker-compose up -d

# Install Python dependencies
pip install -r requirements.txt

# Run backend tests
pytest tests/backend/test_integration.py -v
```

## 🧪 Running Tests Locally
```bash
# Backend integration tests
pytest tests/backend/test_integration.py -v

# Generate HTML report
pytest tests/backend/test_integration.py --html=report.html --self-contained-html
```

## 🔄 CI/CD Pipeline Stages
1. **Source** - GitHub webhook triggers on push/PR
2. **Build** - Docker containers built and started
3. **Test** - Automated backend & frontend tests
4. **Staging** - Deploy to staging environment
5. **Production** - Deploy to production (manual approval)

## 📊 Test Coverage
- ✅ REST API endpoint testing
- ✅ Authentication & authorization
- ✅ CRUD operations (Create, Read, Delete)
- ✅ Input validation & error handling
- ✅ Performance testing
- ✅ Media upload testing

## 🔗 Important Links
- **WordPress Local**: http://localhost:8000
- **WordPress Admin**: http://localhost:8000/wp-admin
- **REST API**: http://localhost:8000/wp-json/

## 📝 Default Credentials
- **Username**: admin
- **Password**: password

## 📄 License
This is an educational project for Software Quality Engineering course.

## 📞 Contact
For questions, contact: [your-email@example.com]
