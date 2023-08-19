from locust import FastHttpUser
from locust import task

OS_ENDPOINT="/v1/worker/1"


class HelloWorldUser(FastHttpUser):
    @task
    def hello_world(self):
        try:
            with self.client.get(OS_ENDPOINT, headers={
                        "accept": "application/json",
                    }, catch_response=True) as resp:
                json_res = resp.json()
                print("json_res: ", json_res)
                if "detail" in json_res:
                    resp.failure("200 error: " + str(json_res["error"]))
        except Exception as e:
            resp.failure(f"Exception: {str(e)}")
