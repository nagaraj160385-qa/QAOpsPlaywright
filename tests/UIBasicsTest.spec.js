const {test,expect} = require('@playwright/test');


test('Login Tets cases', async({page})=>
{
    await page.goto("https://rahulshettyacademy.com/loginpagePractise");
    await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");
    
    const username=page.locator('#username');
    const password=page.locator('#password')
    const signInBtn=page.locator('#signInBtn');
    const title=page.locator('[class="card-title"] a')

    await username.fill("rahulshetty");
    //await username.clear();
    await password.fill("Learning@830$3mK2");
    await signInBtn.click();

    console.log(await page.locator("[style*='block']").textContent()); 
    expect(await page.locator("[style*='block']")).toContainText("Incorrect"); 

    await username.fill("");
    await username.fill("rahulshettyacademy");
    await signInBtn.click();

    console.log(await title.nth(0).textContent());
    console.log(await title.nth(1).textContent());
    console.log(await title.first().textContent());
    console.log(await title.last().textContent());

    const allTitles= await title.allTextContents();
    console.log(allTitles);

});