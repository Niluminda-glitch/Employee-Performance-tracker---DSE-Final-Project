const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EmpTrack API Documentation',
      version: '1.0.0',
      description: `
        ## 🏢 EmpTrack - Employee Management System API

        A comprehensive employee management system with features for task management,
        skill tracking, mentorship, and performance analytics.

        ### 🔑 Authentication
        This API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication.

        ### 🎯 Key Features
        - **User Management**: Role-based access control (Employee, Supervisor, Manager)
        - **Task Management**: Create, assign, and track tasks with deadlines
        - **Skill Tracking**: Manage employee skills and proficiency levels
        - **Mentorship System**: Connect employees with mentors based on skills
        - **Request Management**: Handle leave and overtime requests
        - **Notifications**: Real-time system and task notifications
        - **Analytics**: Performance insights and trend analysis

        ### 🌐 Base URLs
        - **Main API**: http://localhost:5000/api
        - **Trends API**: http://localhost:3001/api

        ### 📊 Database
        - **Type**: PostgreSQL (Supabase)
        - **ORM**: Sequelize
        - **Features**: UUID primary keys, ENUM types, foreign key relationships
      `,
      contact: {
        name: 'EmpTrack Support',
        email: 'support@emptrack.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server (Main API)'
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server (Trends API)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        },
        authToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-auth-token',
          description: 'JWT token in x-auth-token header'
        }
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            full_name: {
              type: 'string',
              description: 'Full name of the user'
            },
            role: {
              type: 'string',
              enum: ['employee', 'supervisor', 'manager'],
              description: 'User role in the system'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'first_login'],
              description: 'Current user status'
            },
            job_title: {
              type: 'string',
              nullable: true,
              description: 'Job title or position'
            },
            department_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Department identifier'
            },
            supervisor_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Supervisor user identifier'
            },
            avatar_url: {
              type: 'string',
              nullable: true,
              description: 'Profile picture URL'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          required: ['id', 'email', 'full_name', 'role', 'status']
        },

        // Authentication Schemas
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            }
          },
          required: ['email', 'password']
        },

        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },

        RegisterRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string',
              minLength: 6
            },
            full_name: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['employee', 'supervisor', 'manager'],
              default: 'employee'
            },
            job_title: {
              type: 'string',
              nullable: true
            },
            department_id: {
              type: 'string',
              format: 'uuid',
              nullable: true
            }
          },
          required: ['email', 'password', 'full_name']
        },

        // Task Schemas
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            title: {
              type: 'string',
              description: 'Task title'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Detailed task description'
            },
            assignee_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Assigned user ID'
            },
            supervisor_id: {
              type: 'string',
              format: 'uuid',
              description: 'Task creator/supervisor ID'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in-progress', 'completed'],
              description: 'Current task status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Task priority level'
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Task deadline'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'title', 'supervisor_id', 'status', 'priority']
        },

        CreateTaskRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Task title'
            },
            description: {
              type: 'string',
              nullable: true
            },
            assignee_id: {
              type: 'string',
              format: 'uuid'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium'
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              nullable: true
            }
          },
          required: ['title', 'assignee_id']
        },

        // Department Schema
        Department: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              description: 'Department name'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Department description'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'name']
        },

        // Error Response Schema
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          },
          required: ['message']
        },

        // Success Response Schema
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },

        // Skill Schema
        Skill: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              description: 'Skill name'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Skill description'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'name']
        },

        // Notification Schema
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            title: {
              type: 'string',
              description: 'Notification title'
            },
            message: {
              type: 'string',
              description: 'Notification message'
            },
            type: {
              type: 'string',
              enum: ['system', 'task_assigned', 'task_completed', 'deadline_reminder', 'mentorship_request', 'request_approved', 'request_rejected', 'announcement'],
              description: 'Notification type'
            },
            is_read: {
              type: 'boolean',
              default: false,
              description: 'Whether notification has been read'
            },
            related_task_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Related task ID if applicable'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'user_id', 'title', 'message', 'type']
        },

        // Request Schema
        Request: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            type: {
              type: 'string',
              enum: ['leave', 'overtime'],
              description: 'Request type'
            },
            start_date: {
              type: 'string',
              format: 'date',
              description: 'Request start date'
            },
            end_date: {
              type: 'string',
              format: 'date',
              description: 'Request end date'
            },
            hours: {
              type: 'integer',
              nullable: true,
              description: 'Hours for overtime requests'
            },
            reason: {
              type: 'string',
              description: 'Reason for the request'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              default: 'pending',
              description: 'Request status'
            },
            approver_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID of the approver'
            },
            approved_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Approval timestamp'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'user_id', 'type', 'start_date', 'end_date', 'reason', 'status']
        },

        // User Skill Schema
        UserSkill: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            user_id: {
              type: 'string',
              format: 'uuid'
            },
            skill_id: {
              type: 'string',
              format: 'uuid'
            },
            proficiency_level: {
              type: 'string',
              enum: ['learning', 'proficient', 'expert'],
              description: 'User proficiency level for this skill'
            },
            willing_to_mentor: {
              type: 'boolean',
              default: false,
              description: 'Whether user is willing to mentor others in this skill'
            },
            is_certified: {
              type: 'boolean',
              default: false,
              description: 'Whether user is certified in this skill'
            },
            is_training: {
              type: 'boolean',
              default: true,
              description: 'Whether user is currently training in this skill'
            },
            last_certified_date: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Date of last certification'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'user_id', 'skill_id', 'proficiency_level']
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        authToken: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './docs/swagger.yaml'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'EmpTrack API Documentation'
  })
};
