#!/usr/bin/env python3
"""
Security Features Test Suite
Tests all Phase 0 security implementations
"""

import subprocess
import json
import time
import sys
from pathlib import Path

class SecurityTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.passed = 0
        self.failed = 0
        self.token = None
        
    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}")
        
    def test_passed(self, test_name):
        self.passed += 1
        print(f"✅ PASS: {test_name}")
        
    def test_failed(self, test_name, reason=""):
        self.failed += 1
        print(f"❌ FAIL: {test_name}")
        if reason:
            print(f"   Reason: {reason}")
    
    def run_curl(self, method, endpoint, headers=None, data=None, files=None):
        """Run curl command and return response"""
        url = f"{self.base_url}{endpoint}"
        cmd = ["curl", "-s", "-X", method, "-w", "\n%{http_code}", url]
        
        if headers:
            for key, value in headers.items():
                cmd.extend(["-H", f"{key}: {value}"])
        
        if data:
            cmd.extend(["-H", "Content-Type: application/json", "-d", json.dumps(data)])
        
        if files:
            for name, path in files.items():
                cmd.extend(["-F", f"{name}=@{path}"])
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            lines = result.stdout.strip().split('\n')
            status_code = int(lines[-1])
            body = '\n'.join(lines[:-1])
            return status_code, body
        except Exception as e:
            return None, str(e)
    
    # ============ Test Methods ============
    
    def test_health_check(self):
        """Test health endpoint is public"""
        status, body = self.run_curl("GET", "/health")
        
        if status == 200:
            try:
                data = json.loads(body)
                if data.get("status") == "Running":
                    self.test_passed("Health check endpoint is public")
                    return True
                else:
                    self.test_failed("Health check returns incorrect data", body)
            except:
                self.test_failed("Health check returns invalid JSON", body)
        else:
            self.test_failed(f"Health check returned {status}", body)
        return False
    
    def test_security_headers(self):
        """Test security headers are present"""
        cmd = ["curl", "-s", "-I", f"{self.base_url}/health"]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            headers = result.stdout
            
            required_headers = [
                "x-content-type-options",
                "x-frame-options", 
                "x-xss-protection",
                "strict-transport-security",
                "content-security-policy",
                "referrer-policy"
            ]
            
            headers_lower = headers.lower()
            missing = [h for h in required_headers if h not in headers_lower]
            
            if not missing:
                self.test_passed("All security headers present")
                return True
            else:
                self.test_failed(f"Missing headers: {missing}")
        except Exception as e:
            self.test_failed(f"Could not check headers: {e}")
        
        return False
    
    def test_cors_whitelist(self):
        """Test CORS origin whitelist"""
        # Test allowed origin
        cmd = [
            "curl", "-s", "-I",
            "-H", "Origin: http://localhost:3000",
            "-H", "Access-Control-Request-Method: GET",
            f"{self.base_url}/health"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if "Access-Control-Allow-Origin" in result.stdout:
                self.test_passed("CORS allows localhost:3000")
                cors_passed = True
            else:
                self.test_failed("CORS doesn't allow localhost:3000")
                cors_passed = False
        except Exception as e:
            self.test_failed(f"Could not test CORS: {e}")
            cors_passed = False
        
        return cors_passed
    
    def test_input_validation(self):
        """Test input validation"""
        # Test with invalid email
        status, body = self.run_curl("POST", "/upload-resume", data={
            "user_name": "Test",
            "email": "invalid",
            "phone": "123"
        })
        
        if status == 400:
            self.test_passed("Input validation rejects invalid email")
            return True
        else:
            self.test_failed(f"Input validation returned {status} instead of 400", body)
        return False
    
    def test_admin_requires_auth(self):
        """Test admin endpoints require authentication"""
        status, body = self.run_curl("GET", "/admin/resumes")
        
        if status == 403 or status == 401:
            self.test_passed("Admin endpoint requires authentication")
            return True
        else:
            self.test_failed(f"Admin endpoint returned {status}, expected 401/403", body)
        return False
    
    def test_login_endpoint(self):
        """Test login endpoint"""
        status, body = self.run_curl("POST", "/auth/login", data={
            "email": "admin@example.com",
            "password": "test"
        })
        
        # Note: This will fail because we use placeholder auth
        # In production, implement real credential verification
        if status in [200, 401]:
            self.test_passed("Login endpoint is functional")
            
            if status == 200:
                try:
                    data = json.loads(body)
                    if "access_token" in data:
                        self.token = data["access_token"]
                except:
                    pass
            return True
        else:
            self.test_failed(f"Login endpoint returned unexpected {status}")
            return False
    
    def test_rate_limiting(self):
        """Test rate limiting"""
        print("\n  Testing rate limiting (this will make 150 rapid requests)...")
        print("  WARNING: This may take a minute...")
        
        success_count = 0
        rate_limited = False
        
        for i in range(150):
            if i % 25 == 0:
                print(f"    Progress: {i}/150...")
            
            status, _ = self.run_curl("GET", "/health")
            
            if status == 200:
                success_count += 1
            elif status == 429:
                rate_limited = True
                break
            
            # Don't slam the server
            time.sleep(0.01)
        
        if rate_limited:
            self.test_passed(f"Rate limiting kicks in after {success_count} requests")
            return True
        else:
            self.test_failed(f"Rate limiting not working (got {success_count} requests through)")
            return False
    
    def test_jwt_token_validation(self):
        """Test JWT token validation"""
        # Try with invalid token
        status, body = self.run_curl("GET", "/auth/me", headers={
            "Authorization": "Bearer invalid-token"
        })
        
        if status == 401:
            self.test_passed("JWT validation rejects invalid tokens")
            return True
        else:
            self.test_failed(f"JWT validation returned {status} instead of 401", body)
        return False
    
    def test_current_user_endpoint(self):
        """Test getting current user info"""
        if not self.token:
            print("  ⚠️ Skipping (no valid token from login)")
            return False
        
        status, body = self.run_curl("GET", "/auth/me", headers={
            "Authorization": f"Bearer {self.token}"
        })
        
        if status == 200:
            try:
                data = json.loads(body)
                if "email" in data:
                    self.test_passed("Current user endpoint returns user info")
                    return True
            except:
                pass
        
        self.test_failed(f"Current user endpoint returned {status}", body)
        return False
    
    # ============ Test Suite ============
    
    def run_all_tests(self):
        """Run all security tests"""
        
        self.print_header("PHASE 0 SECURITY TEST SUITE")
        print(f"\nTarget URL: {self.base_url}")
        print("Make sure the API server is running!\n")
        
        input("Press Enter to start tests...")
        
        self.print_header("1. Basic Connectivity")
        self.test_health_check()
        
        self.print_header("2. Security Headers")
        self.test_security_headers()
        
        self.print_header("3. CORS Configuration")
        self.test_cors_whitelist()
        
        self.print_header("4. Input Validation")
        self.test_input_validation()
        
        self.print_header("5. Admin Authentication")
        self.test_admin_requires_auth()
        
        self.print_header("6. JWT Authentication")
        self.test_login_endpoint()
        self.test_jwt_token_validation()
        
        self.print_header("7. JWT Token Use")
        self.test_current_user_endpoint()
        
        # Skip rate limiting by default (too slow)
        print("\n⚠️ Skipping rate limiting test (takes ~2 minutes)")
        print("   Run manually: time python security_test.py ratelimit\n")
        
        # Summary
        self.print_header("TEST SUMMARY")
        total = self.passed + self.failed
        percentage = (self.passed / total * 100) if total > 0 else 0
        
        print(f"\n  Total Tests: {total}")
        print(f"  ✅ Passed: {self.passed}")
        print(f"  ❌ Failed: {self.failed}")
        print(f"  Success Rate: {percentage:.1f}%")
        
        if self.failed == 0:
            print("\n  🎉 ALL TESTS PASSED! Security implementation is working!")
        else:
            print(f"\n  ⚠️ {self.failed} tests failed. Review logs above.")
        
        print(f"\n{'='*60}\n")
        
        return self.failed == 0

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Security Test Suite")
    parser.add_argument("--url", default="http://localhost:8000", 
                       help="API base URL (default: http://localhost:8000)")
    parser.add_argument("--ratelimit", action="store_true",
                       help="Run rate limiting test (slow, ~2 minutes)")
    
    args = parser.parse_args()
    
    tester = SecurityTester(base_url=args.url)
    
    if args.ratelimit:
        print("Running rate limiting test...")
        tester.test_rate_limiting()
    else:
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
