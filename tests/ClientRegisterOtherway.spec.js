const {test,expect}=require('@playwright/test');


test('End to End Test cases using playwright getByLocators', async({page})=>
{

    const url="https://rahulshettyacademy.com/client/#/auth/login";
    const email ="kh.nagaraj@gmail.com";
    const password="Test@123";
    const productName="ZARA COAT 3";
    await page.goto(url);

    const emailInput = await page.getByPlaceholder("email@example.com");
    const passwordInput = await page.getByPlaceholder("enter your passsword");
    const LoginBtn = await page.getByRole('button',{name:"Login"});

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await LoginBtn.click();

    await page.waitForLoadState('networkidle');
    await page.locator(".card-body b").first().waitFor();
    await page.locator(".card-body").filter({hasText:productName}).getByRole("button",{name:" Add To Cart"}).click();
    await page.getByRole("listitem").getByRole("button",{name:"Cart"}).click(); 

    await page.locator("div li").first().waitFor();
    await expect(page.getByText(productName)).toBeVisible();
    await page.getByRole("button",{name:"Checkout"}).click(); 

    await page.getByPlaceholder("Select Country").pressSequentially("ind",{delay:1000}); 
    await page.getByRole("button",{name:"India"}).nth(1).click();  
   // await page.pause(); 
   await page.getByText("PLACE ORDER").click(); 
   await expect(page.getByText(" Thankyou for the order. ")).toBeVisible();


});
