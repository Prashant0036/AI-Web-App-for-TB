from LLM import llm_model as llm

# import asyncio

import json, re






async def get_llm_res(data) :
    # data is JSON formatted user data

    prompt = f"""Hey! react as a Tuberculosis consultant. 
            I'm providing my info as a JSON file and you will give me response without any preamble.
            Your response should be very personalized [use my name] and it should feel like any expert Tuberculosis
              consultant is consulting with me.
            
            response should be also in json format ** under 190 characters **, it must have 3 fields "score", "test" and "tips" and no other text or preamble  :

            response must start with a curly braces then 3 fields and then end with a curly braces, nothing else
              
            "score" : give me a TB score (0-100), chances of happening TB to me 
            according to my symptoms
            2. "test" : any recommended diagnostic or blood test or whatever else return no test needed
            3. "tips" : some additional tips according to my behavioural based answers

            Ex. if Smoking or Alcohol is true in my JSON data, you can give tips to avoid it.

            my info is {data} 

        """
    
    response = await llm.generate(prompt)
    match = re.search(r'\{.*\}', response, re.DOTALL)
    llm_res_dict = {"score":0,"test":"None","tips":"None"}
    if match:
      json_str = match.group(0)
      llm_res_dict = json.loads(json_str)
      print(type(llm_res_dict))
      print(llm_res_dict)
    else:
      print("No JSON found")
    # print(response)
    # return response
    return llm_res_dict


# asyncio.run(get_llm_res({"name":"Pras","age":30}))





    
