const {test,expect} = require('@playwright/test');

test('Client Register Test case', async({page})=>
{
    await page.goto("https://rahulshettyacademy.com/client/#/auth/register");
    await page.locator('#firstName').fill("NagarajTestuser");
    await page.locator('#lastName').fill("HittalamaniTestuser");
    await page.locator('#userEmail').fill("nagarajtestuser@example.com");
    await page.locator('#userMobile').fill("1234567890");
    await page.locator('#userPassword').fill("Nagaraj@123");
    await page.locator('#confirmPassword').fill("Nagaraj@123");
    await page.locator("[value='Register']").click();
    
    await page.goto("https://rahulshettyacademy.com/client/#/auth/login");
    await page.locator('#userEmail').fill("nagarajtestuser@example.com");
    await page.locator('#userPassword').fill("Nagaraj@123");
    await page.locator("[value='Login']").click();
    

});

test('Client Login Test case', async({page})=>
{
  
    await page.goto("https://rahulshettyacademy.com/client/#/auth/login");
    await page.locator('#userEmail').fill("nagarajtestuser@example.com");
    await page.locator('#userPassword').fill("Test@123");
    await page.locator("[value='Login']").click();

    console.log(await page.locator('h5 b').first(0).textContent());
    

});

test('UI Controls', async({page})=>
{
//Dropdown  
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    
    const username=page.locator('#username');
    const password=page.locator('#password')
    const signInBtn=page.locator('#signInBtn');
    const title=page.locator('[class="card-title"] a')
    const linkname=page.locator('[class="blinkingText"]').first();

    await username.fill("rahulshetty");
    //await username.clear();
    await password.fill("Learning@830$3mK2");


    // Dropdown
    const dropdown = await page.locator('select.form-control');
    await dropdown.selectOption('consult');
    // Radio button
    await page.locator('.radiotextsty').first().click();
    expect(await page.locator('.radiotextsty').first()).toBeChecked();
    //checkbox
    await page.locator('#terms').click();
    expect(await page.locator('#terms')).toBeChecked();
    //uncheck the checkbox
    await page.locator('#terms').uncheck();
    expect(await page.locator('#terms').isChecked()).toBeFalsy(); 
    //await page.pause();

    await expect (linkname).toHaveText("Free Access to InterviewQues/ResumeAssistance/Material");


    });

test('child window handeling',async({browser})=>
{
    const context =await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

     const title=page.locator('[class="card-title"] a')
  //   const linkname=page.locator('[class="blinkingText"]').first();

    const documentlinkname = page.locator("[href*='documents-request']");
     
     const [newPage] =await  Promise.all([
     
     context.waitForEvent('page'),
     documentlinkname.click()
     ])

    // console.log(await newPage.locator(".red").textContent());

     const text= await newPage.locator(".red").textContent();
     console.log(text); 

     const website =await text.split("@")[1];
     const domain = await website.split(" ")[0];
     console.log(domain);
});

test('end to end test', async({page})=>
{

    const email="nagarajtestuser@example.com";
    const password ="Test@123";
    const url="https://rahulshettyacademy.com/client/#/auth/login";
    const productname="ZARA COAT 3";
    const products=page.locator(".card-body");

    await page.goto(url);
    await page.locator('#userEmail').fill(email);
    await page.locator('#userPassword').fill(password);
    await page.locator("[value='Login']").click();

    // wait for the products to load 
    await page.waitForLoadState('networkidle');
    await page.locator(".card-body b").first().waitFor();

    const titles=await products.locator("b").allTextContents();
    const count = await products.count();

    for (let i=0; i<count; ++i)
    {
        if(await products.nth(i).locator("b").textContent()===productname)
        {
            await products.nth(i).locator("text=Add To Cart").click();
            break;
        }
    }
  //  console.log(titles);

    await page.locator("[routerlink*=cart]").click();
    
    // wait for the cart page to load and display the products 
    await page.locator("div li").first().waitFor();

    // Assertion to check if the product is added to the cart 
    const bool = await page.locator("h3:has-text('ZARA COAT 3')").isVisible();
    expect(bool).toBeTruthy();
    await page.locator("text=checkout").click();

    await page.getByPlaceholder('Select Country').pressSequentially("ind",{delay:1000});

    const dropdown=page.locator(".ta-results");
    const countbutton=await dropdown.locator("button").count();
    for(let i=0;i<countbutton;i++){
        const text=await dropdown.locator("button").nth(i).textContent();

        if(text===" India") {
            await dropdown.locator("button").nth(i).click();
            break;
        }

    }
    
   // await page.locator(".user__name [type='text']").first().toHaveText("email");

   expect(page.locator(".user__name [type='text']").first()).toHaveText(email);
   await page.locator(".action__submit").click();
   await expect(page.locator(".hero-primary")).toHaveText(" Thankyou for the order. ");
   const orderId = await page.locator(".em-spacer-1 .ng-star-inserted").textContent();
   console.log(orderId);
    
    await page.pause();

 

    
});