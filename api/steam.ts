import type { VercelRequest, VercelResponse } from "@vercel/node"
import { initPage } from "./_lib/chromium"

export default async (req: VercelRequest, res: VercelResponse) => {
  var hrstart = process.hrtime()
  const { query } = req

  if (!query.genre || !query.page) {
    res.statusCode = 400
    res.end("No genre or page found")
  }

  try {
    const page = await initPage()
    await page.goto(`https://store.steampowered.com/tags/en/${query.genre}/#p=${query.page}&tab=NewReleases`)

    await page.waitForSelector("#NewReleasesTable")
    await page.waitForNetworkIdle()

    let data = await page.$$eval(
      "#NewReleasesRows > a",
      (item, query: any) => {
        // Extract the item from the data
        return item.map((el) => {
          let link = el.getAttribute("href")
          let id = +link.match(/app\/(.*?)\//i)[1]
          let image = el.querySelector(".tab_item_cap_img")?.getAttribute("src")
          let name = (el.querySelector(".tab_item_name") as HTMLElement)?.innerText
          let price = (el.querySelector(".discount_final_price") as HTMLElement)?.innerText
          let tags = (el.querySelector(".tab_item_top_tags") as HTMLElement)?.innerText.split(", ")
          let platform = [
            el.querySelector(".platform_img.win") ? "Windows" : null,
            el.querySelector(".platform_img.mac") ? "Mac" : null,
            el.querySelector(".platform_img.linux") ? "Linux" : null,
          ].filter((i) => i)

          let genre = query.genre as string
          return { id, link, image, name, price, tags, platform, genre }
        })
      },
      query
    )

    var hrend = process.hrtime(hrstart)
    console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000)
    res.json(data)
  } catch (err) {
    console.log({ err })
    res.statusCode = 500
    res.end(err)
  }
}

// ** Genre **
// Free to Play
// Early Access
// Action
// Adventure
// Casual
// Indie
// Massively Multiplayer
// Racing
// RPG
// Simulation
// Sports
// Strategy
