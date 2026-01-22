from flask import Flask
from flask_cors import CORS
from api.routes import api_bp
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize Extensions
    CORS(app)
    
    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    @app.route('/')
    def index():
        return {'message': 'Welcome to CINEMATIQ Backend API', 'status': 'running'}

    @app.route('/favicon.ico')
    def favicon():
        return '', 204
        
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'CINEMATIQ Backend'}
        
    return app

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
